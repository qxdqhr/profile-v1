CREATE TABLE "exam_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"last_modified" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_type_id" text NOT NULL,
	"question_id" text NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"options" json NOT NULL,
	"answer" text,
	"answers" json,
	"score" integer NOT NULL,
	"special_effect" json
);
--> statement-breakpoint
CREATE TABLE "exam_types" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_type_id_exam_types_id_fk" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_types"("id") ON DELETE cascade ON UPDATE no action;