CREATE TABLE `projects` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`metadata` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`roots` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `remote_state` (
	`key` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`archived` integer DEFAULT false NOT NULL,
	`project_id` text,
	`session_file` text NOT NULL UNIQUE,
	`id` text PRIMARY KEY,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_threads_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `writer_leases` (
	`expires_at_ms` integer NOT NULL,
	`fence` integer NOT NULL,
	`owner_id` text NOT NULL,
	`owner_kind` text NOT NULL,
	`thread_id` text PRIMARY KEY,
	CONSTRAINT "writer_leases_owner_kind_check" CHECK("owner_kind" in ('daemon', 'tui'))
);
--> statement-breakpoint
CREATE INDEX `projects_order_idx` ON `projects` (`position`,`created_at`);--> statement-breakpoint
CREATE INDEX `threads_updated_at_idx` ON `threads` (`updated_at`);