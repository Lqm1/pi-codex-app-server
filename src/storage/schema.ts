import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import type { JsonValue } from "../../vendor/openai-codex-app-server-protocol/typescript/serde_json/JsonValue.js";
import type {
  ProjectRoot,
  StoredProject,
  WriterKind,
} from "./metadata-records.js";

export const projects = sqliteTable(
  "projects",
  {
    createdAt: integer("created_at").notNull(),
    id: text().notNull().primaryKey(),
    metadata: text({ mode: "json" })
      .$type<StoredProject["metadata"]>()
      .notNull(),
    name: text().notNull(),
    position: integer().notNull(),
    roots: text({ mode: "json" }).$type<readonly ProjectRoot[]>().notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("projects_order_idx").on(table.position, table.createdAt)]
);

export const threads = sqliteTable(
  "threads",
  {
    archived: integer({ mode: "boolean" }).notNull().default(false),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    sessionFile: text("session_file").notNull().unique(),
    threadId: text("id").notNull().primaryKey(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("threads_updated_at_idx").on(table.updatedAt)]
);

export const writerLeases = sqliteTable(
  "writer_leases",
  {
    expiresAtMs: integer("expires_at_ms").notNull(),
    fence: integer().notNull(),
    ownerId: text("owner_id").notNull(),
    ownerKind: text("owner_kind").$type<WriterKind>().notNull(),
    threadId: text("thread_id").notNull().primaryKey(),
  },
  (table) => [
    check(
      "writer_leases_owner_kind_check",
      sql`${table.ownerKind} in ('daemon', 'tui')`
    ),
  ]
);

export const remoteState = sqliteTable("remote_state", {
  key: text().notNull().primaryKey(),
  updatedAt: integer("updated_at").notNull(),
  value: text({ mode: "json" }).$type<JsonValue>().notNull(),
});
