CREATE TABLE "mikutap_background_music" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"name" text NOT NULL,
	"file" text NOT NULL,
	"file_type" text DEFAULT 'uploaded' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"volume" real DEFAULT 0.5 NOT NULL,
	"loop" boolean DEFAULT true NOT NULL,
	"bpm" integer DEFAULT 120 NOT NULL,
	"description" text,
	"size" integer,
	"duration" real,
	"generation_config" json,
	"rhythm_pattern" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mikutap_background_music" ADD CONSTRAINT "mikutap_background_music_config_id_mikutap_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."mikutap_configs"("id") ON DELETE cascade ON UPDATE no action;