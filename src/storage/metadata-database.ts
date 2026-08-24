import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-sqlite";
import type { NodeSQLiteDatabase } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { z } from "zod";

import type { JsonValue } from "../../vendor/openai-codex-app-server-protocol/typescript/serde_json/JsonValue.js";
import type {
  StoredProject,
  ThreadMetadata,
  WriterKind,
  WriterLease,
} from "./metadata-records.js";
import { projects, remoteState, threads, writerLeases } from "./schema.js";

const projectMetadataSchema = z.record(z.string(), z.string());
const projectRootsSchema = z.array(z.object({ path: z.string() }));
const migrationFolderCandidates = [
  fileURLToPath(new URL("../drizzle", import.meta.url)),
  fileURLToPath(new URL("../../drizzle", import.meta.url)),
];

const resolveMigrationsFolder = (): string => {
  const migrationsFolder = migrationFolderCandidates.find((candidate) =>
    existsSync(candidate)
  );
  if (!migrationsFolder) {
    throw new Error("Drizzle migrations directory was not found");
  }
  return migrationsFolder;
};

const projectFromRow = (row: typeof projects.$inferSelect): StoredProject => ({
  ...row,
  metadata: projectMetadataSchema.parse(row.metadata),
  roots: projectRootsSchema.parse(row.roots),
});

export class MetadataDatabase {
  readonly #database: NodeSQLiteDatabase;
  readonly #sqlite: DatabaseSync;

  constructor(path: string) {
    this.#sqlite = new DatabaseSync(path);
    this.#sqlite.exec(
      "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;"
    );
    this.#database = drizzle({ client: this.#sqlite });
    try {
      migrate(this.#database, { migrationsFolder: resolveMigrationsFolder() });
    } catch (error) {
      this.#sqlite.close();
      throw error;
    }
  }

  close(): void {
    this.#sqlite.close();
  }

  listProjects(): readonly StoredProject[] {
    return this.#database
      .select()
      .from(projects)
      .orderBy(asc(projects.position), asc(projects.createdAt))
      .all()
      .map(projectFromRow);
  }

  upsertProject(project: StoredProject): void {
    this.#database
      .insert(projects)
      .values(project)
      .onConflictDoUpdate({
        set: {
          metadata: project.metadata,
          name: project.name,
          position: project.position,
          roots: project.roots,
          updatedAt: project.updatedAt,
        },
        target: projects.id,
      })
      .run();
  }

  listThreads(): readonly ThreadMetadata[] {
    return this.#database
      .select()
      .from(threads)
      .orderBy(desc(threads.updatedAt))
      .all();
  }

  getThread(threadId: string): ThreadMetadata | undefined {
    return this.#database
      .select()
      .from(threads)
      .where(eq(threads.threadId, threadId))
      .get();
  }

  upsertThread(metadata: ThreadMetadata): void {
    this.#database
      .insert(threads)
      .values(metadata)
      .onConflictDoUpdate({
        set: {
          archived: metadata.archived,
          projectId: metadata.projectId,
          sessionFile: metadata.sessionFile,
          updatedAt: metadata.updatedAt,
        },
        target: threads.threadId,
      })
      .run();
  }

  deleteThread(threadId: string): void {
    this.#database.delete(threads).where(eq(threads.threadId, threadId)).run();
  }

  setThreadArchived(threadId: string, archived: boolean): boolean {
    const result = this.#database
      .update(threads)
      .set({ archived, updatedAt: Date.now() })
      .where(eq(threads.threadId, threadId))
      .run();
    return result.changes === 1;
  }

  acquireLease(options: {
    readonly nowMs: number;
    readonly ownerId: string;
    readonly ownerKind: WriterKind;
    readonly threadId: string;
    readonly ttlMs: number;
  }): WriterLease | undefined {
    return this.#database.transaction(
      (transaction) => {
        const currentLease = transaction
          .select()
          .from(writerLeases)
          .where(eq(writerLeases.threadId, options.threadId))
          .get();
        if (!currentLease) {
          return transaction
            .insert(writerLeases)
            .values({
              expiresAtMs: options.nowMs + options.ttlMs,
              fence: 1,
              ownerId: options.ownerId,
              ownerKind: options.ownerKind,
              threadId: options.threadId,
            })
            .returning()
            .get();
        }
        const leaseIsOwnedByAnotherWriter =
          currentLease.ownerId !== options.ownerId &&
          currentLease.expiresAtMs > options.nowMs;
        if (leaseIsOwnedByAnotherWriter) {
          return;
        }
        return transaction
          .update(writerLeases)
          .set({
            expiresAtMs: options.nowMs + options.ttlMs,
            fence: currentLease.fence + 1,
            ownerId: options.ownerId,
            ownerKind: options.ownerKind,
          })
          .where(eq(writerLeases.threadId, options.threadId))
          .returning()
          .get();
      },
      { behavior: "immediate" }
    );
  }

  renewLease(options: {
    readonly expiresAtMs: number;
    readonly fence: number;
    readonly ownerId: string;
    readonly threadId: string;
  }): WriterLease | undefined {
    return this.#database
      .update(writerLeases)
      .set({ expiresAtMs: options.expiresAtMs })
      .where(
        and(
          eq(writerLeases.threadId, options.threadId),
          eq(writerLeases.ownerId, options.ownerId),
          eq(writerLeases.fence, options.fence)
        )
      )
      .returning()
      .get();
  }

  releaseLease(threadId: string, ownerId: string): boolean {
    const result = this.#database
      .delete(writerLeases)
      .where(
        and(
          eq(writerLeases.threadId, threadId),
          eq(writerLeases.ownerId, ownerId)
        )
      )
      .run();
    return result.changes === 1;
  }

  getRemoteState(key: string): JsonValue | undefined {
    const row = this.#database
      .select({ value: remoteState.value })
      .from(remoteState)
      .where(eq(remoteState.key, key))
      .get();
    return row ? z.json().parse(row.value) : undefined;
  }

  setRemoteState(key: string, value: JsonValue): void {
    const updatedAt = Date.now();
    this.#database
      .insert(remoteState)
      .values({ key, updatedAt, value })
      .onConflictDoUpdate({
        set: { updatedAt, value },
        target: remoteState.key,
      })
      .run();
  }
}
