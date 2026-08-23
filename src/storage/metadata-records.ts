export interface ProjectRoot {
  readonly path: string;
}

export interface StoredProject {
  readonly createdAt: number;
  readonly id: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly name: string;
  readonly position: number;
  readonly roots: readonly ProjectRoot[];
  readonly updatedAt: number;
}

export interface ThreadMetadata {
  readonly archived: boolean;
  readonly projectId: string | null;
  readonly sessionFile: string;
  readonly threadId: string;
  readonly updatedAt: number;
}

export type WriterKind = "daemon" | "tui";

export interface WriterLease {
  readonly expiresAtMs: number;
  readonly fence: number;
  readonly ownerId: string;
  readonly ownerKind: WriterKind;
  readonly threadId: string;
}
