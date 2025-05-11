CREATE TABLE "exam_result_modals" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"show_delay_time" integer NOT NULL,
	"messages" json NOT NULL,
	"button_text" text NOT NULL,
	"passing_score" integer NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_start_screens" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"rules" json NOT NULL,
	"button_text" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
