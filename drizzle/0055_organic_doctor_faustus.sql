CREATE TABLE "skill_manager_sync_states" (
	"skill_id" text PRIMARY KEY NOT NULL,
	"base_hash" text DEFAULT '' NOT NULL,
	"remote_hash" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_manager_sync_tasks" (
	"task_id" text PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"strategy" text NOT NULL,
	"status" text NOT NULL,
	"total" integer NOT NULL,
	"success_count" integer NOT NULL,
	"failed_count" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"finished_at" timestamp,
	"items" json NOT NULL,
	"metrics" json,
	"logs" json
);
--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD PRIMARY KEY ("id");