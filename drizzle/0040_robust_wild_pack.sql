CREATE TABLE "export_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"format" text NOT NULL,
	"fields" jsonb NOT NULL,
	"file_name_template" text NOT NULL,
	"include_header" boolean DEFAULT true NOT NULL,
	"delimiter" text DEFAULT ',' NOT NULL,
	"encoding" text DEFAULT 'utf-8' NOT NULL,
	"add_bom" boolean DEFAULT true NOT NULL,
	"max_rows" integer,
	"module_id" text NOT NULL,
	"business_id" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_history" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"export_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"exported_rows" integer NOT NULL,
	"duration" integer,
	"status" text NOT NULL,
	"error" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD COLUMN "pickup_method" text;--> statement-breakpoint
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_config_id_export_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."export_configs"("id") ON DELETE no action ON UPDATE no action;