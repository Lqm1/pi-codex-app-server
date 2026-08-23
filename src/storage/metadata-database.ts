import { DatabaseSync } from "node:sqlite";
import type { SQLOutputValue, StatementSync } from "node:sqlite";

import { z } from "zod";

import type { JsonValue } from "../../vendor/openai-codex-app-server-protocol/typescript/serde_json/JsonValue.js";
import type {
  StoredProject,
  ThreadMetadata,
  WriterKind,
  WriterLease,
} from "./metadata-records.js";

const SCHEMA_VERSION = 1;
type SqliteRow = Record<string, SQLOutputValue>;
const projectRowSchema = z.object({
  created_at: z.number(),
  id: z.string(),
  metadata_json: z.string(),
  name: z.string(),
  position: z.number(),
  roots_json: z.string(),
  updated_at: z.number(),
});
const threadRowSchema = z.object({
  archived: z.union([z.literal(0), z.literal(1)]),
  project_id: z.string().nullable(),
  session_file: z.string(),
  thread_id: z.string(),
  updated_at: z.number(),
});
const leaseRowSchema = z.object({
  expires_at_ms: z.number(),
  fence: z.number(),
  owner_id: z.string(),
  owner_kind: z.enum(["daemon", "tui"]),
  thread_id: z.string(),
});
const projectMetadataSchema = z.record(z.string(), z.string());
const projectRootsSchema = z.array(z.object({ path: z.string() }));
const schemaVersionRowSchema = z.object({ user_version: z.number() });
const remoteStateRowSchema = z.object({ value_json: z.string() });

const projectFromRow = (input: SqliteRow): StoredProject => {
  const row = projectRowSchema.parse(input);
  return {
    createdAt: row.created_at,
    id: row.id,
    metadata: projectMetadataSchema.parse(JSON.parse(row.metadata_json)),
    name: row.name,
    position: row.position,
    roots: projectRootsSchema.parse(JSON.parse(row.roots_json)),
    updatedAt: row.updated_at,
  };
};

const threadFromRow = (input: SqliteRow): ThreadMetadata => {
  const row = threadRowSchema.parse(input);
  return {
    archived: row.archived === 1,
    projectId: row.project_id,
    sessionFile: row.session_file,
    threadId: row.thread_id,
    updatedAt: row.updated_at,
  };
};

const leaseFromRow = (input: SqliteRow): WriterLease => {
  const row = leaseRowSchema.parse(input);
  return {
    expiresAtMs: row.expires_at_ms,
    fence: row.fence,
    ownerId: row.owner_id,
    ownerKind: row.owner_kind,
    threadId: row.thread_id,
  };
};

export class MetadataDatabase {
  readonly #database: DatabaseSync;
  readonly #statements: Readonly<Record<string, StatementSync>>;

  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(
      "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;"
    );
    this.#migrate();
    this.#statements = {
      acquireLease: this.#database.prepare(`
        INSERT INTO writer_leases (thread_id, owner_id, owner_kind, fence, expires_at_ms)
        VALUES (?, ?, ?, 1, ?)
        ON CONFLICT(thread_id) DO UPDATE SET
          owner_id = excluded.owner_id,
          owner_kind = excluded.owner_kind,
          fence = writer_leases.fence + 1,
          expires_at_ms = excluded.expires_at_ms
        WHERE writer_leases.expires_at_ms <= ? OR writer_leases.owner_id = excluded.owner_id
        RETURNING thread_id, owner_id, owner_kind, fence, expires_at_ms
      `),
      deleteThread: this.#database.prepare(
        "DELETE FROM thread_metadata WHERE thread_id = ?"
      ),
      getRemoteState: this.#database.prepare(
        "SELECT value_json FROM remote_state WHERE key = ?"
      ),
      getThread: this.#database.prepare(
        "SELECT * FROM thread_metadata WHERE thread_id = ?"
      ),
      listProjects: this.#database.prepare(
        "SELECT * FROM projects ORDER BY position ASC, created_at ASC"
      ),
      listThreads: this.#database.prepare(
        "SELECT * FROM thread_metadata ORDER BY updated_at DESC"
      ),
      releaseLease: this.#database.prepare(
        "DELETE FROM writer_leases WHERE thread_id = ? AND owner_id = ?"
      ),
      renewLease: this.#database.prepare(`
        UPDATE writer_leases SET expires_at_ms = ?
        WHERE thread_id = ? AND owner_id = ? AND fence = ?
        RETURNING thread_id, owner_id, owner_kind, fence, expires_at_ms
      `),
      upsertProject: this.#database.prepare(`
        INSERT INTO projects (id, name, roots_json, metadata_json, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          roots_json = excluded.roots_json,
          metadata_json = excluded.metadata_json,
          position = excluded.position,
          updated_at = excluded.updated_at
      `),
      upsertRemoteState: this.#database.prepare(`
        INSERT INTO remote_state (key, value_json, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value_json = excluded.value_json,
          updated_at = excluded.updated_at
      `),
      upsertThread: this.#database.prepare(`
        INSERT INTO thread_metadata (thread_id, session_file, project_id, archived, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(thread_id) DO UPDATE SET
          session_file = excluded.session_file,
          project_id = excluded.project_id,
          archived = excluded.archived,
          updated_at = excluded.updated_at
      `),
    };
  }

  close(): void {
    this.#database.close();
  }

  listProjects(): readonly StoredProject[] {
    return this.#statement("listProjects").all().map(projectFromRow);
  }

  upsertProject(project: StoredProject): void {
    this.#statement("upsertProject").run(
      project.id,
      project.name,
      JSON.stringify(project.roots),
      JSON.stringify(project.metadata),
      project.position,
      project.createdAt,
      project.updatedAt
    );
  }

  listThreads(): readonly ThreadMetadata[] {
    return this.#statement("listThreads").all().map(threadFromRow);
  }

  getThread(threadId: string): ThreadMetadata | undefined {
    const row = this.#statement("getThread").get(threadId);
    return row === undefined ? undefined : threadFromRow(row);
  }

  upsertThread(metadata: ThreadMetadata): void {
    this.#statement("upsertThread").run(
      metadata.threadId,
      metadata.sessionFile,
      metadata.projectId,
      metadata.archived ? 1 : 0,
      metadata.updatedAt
    );
  }

  deleteThread(threadId: string): void {
    this.#statement("deleteThread").run(threadId);
  }

  setThreadArchived(threadId: string, archived: boolean): boolean {
    const thread = this.getThread(threadId);
    if (!thread) {
      return false;
    }
    this.upsertThread({ ...thread, archived, updatedAt: Date.now() });
    return true;
  }

  acquireLease(options: {
    readonly nowMs: number;
    readonly ownerId: string;
    readonly ownerKind: WriterKind;
    readonly threadId: string;
    readonly ttlMs: number;
  }): WriterLease | undefined {
    const expiresAtMs = options.nowMs + options.ttlMs;
    const row = this.#statement("acquireLease").get(
      options.threadId,
      options.ownerId,
      options.ownerKind,
      expiresAtMs,
      options.nowMs
    );
    return row === undefined ? undefined : leaseFromRow(row);
  }

  renewLease(options: {
    readonly expiresAtMs: number;
    readonly fence: number;
    readonly ownerId: string;
    readonly threadId: string;
  }): WriterLease | undefined {
    const row = this.#statement("renewLease").get(
      options.expiresAtMs,
      options.threadId,
      options.ownerId,
      options.fence
    );
    return row === undefined ? undefined : leaseFromRow(row);
  }

  releaseLease(threadId: string, ownerId: string): boolean {
    return this.#statement("releaseLease").run(threadId, ownerId).changes === 1;
  }

  getRemoteState(key: string): JsonValue | undefined {
    const raw = this.#statement("getRemoteState").get(key);
    if (raw === undefined) {
      return undefined;
    }
    const row = remoteStateRowSchema.parse(raw);
    return z.json().parse(JSON.parse(row.value_json));
  }

  setRemoteState(key: string, value: JsonValue): void {
    this.#statement("upsertRemoteState").run(
      key,
      JSON.stringify(value),
      Date.now()
    );
  }

  #migrate(): void {
    const version = this.#database.prepare("PRAGMA user_version").get();
    const { user_version: currentVersion } =
      schemaVersionRowSchema.parse(version);
    if (currentVersion > SCHEMA_VERSION) {
      throw new Error(
        `State database schema ${currentVersion} is newer than supported ${SCHEMA_VERSION}`
      );
    }
    if (currentVersion === 0) {
      this.#database.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          roots_json TEXT NOT NULL,
          metadata_json TEXT NOT NULL,
          position INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE thread_metadata (
          thread_id TEXT PRIMARY KEY,
          session_file TEXT NOT NULL UNIQUE,
          project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
          archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE writer_leases (
          thread_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          owner_kind TEXT NOT NULL CHECK (owner_kind IN ('daemon', 'tui')),
          fence INTEGER NOT NULL,
          expires_at_ms INTEGER NOT NULL
        );
        CREATE TABLE remote_state (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE client_cursors (
          client_id TEXT NOT NULL,
          stream_id TEXT NOT NULL,
          cursor TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (client_id, stream_id)
        );
        PRAGMA user_version = 1;
        COMMIT;
      `);
    }
  }

  #statement(name: string): StatementSync {
    const statement = this.#statements[name];
    if (!statement) {
      throw new Error(`Unknown prepared statement: ${name}`);
    }
    return statement;
  }
}
