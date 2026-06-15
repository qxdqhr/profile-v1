CREATE TABLE "teach_workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"topic" text,
	"status" text DEFAULT 'active' NOT NULL,
	"mission_summary" text,
	"lesson_count" integer DEFAULT 0 NOT NULL,
	"last_lesson_slug" text,
	"last_opened_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teach_lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"lesson_order" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"quiz_score" integer,
	"quiz_total" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"next_review_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teach_generate_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"trigger" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"input_snapshot" jsonb,
	"output_files" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "teach_workspaces" ADD CONSTRAINT "teach_workspaces_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "teach_lesson_progress" ADD CONSTRAINT "teach_lesson_progress_workspace_id_teach_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."teach_workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "teach_generate_jobs" ADD CONSTRAINT "teach_generate_jobs_workspace_id_teach_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."teach_workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "teach_workspaces_user_slug_unique" ON "teach_workspaces" USING btree ("user_id","slug");
--> statement-breakpoint
CREATE UNIQUE INDEX "teach_lesson_progress_workspace_lesson_unique" ON "teach_lesson_progress" USING btree ("workspace_id","lesson_slug");
