CREATE TABLE "mikutap_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rows" integer DEFAULT 6 NOT NULL,
	"cols" integer DEFAULT 5 NOT NULL,
	"sound_library" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mikutap_grid_cells" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"row" integer NOT NULL,
	"col" integer NOT NULL,
	"key" text NOT NULL,
	"sound_type" text NOT NULL,
	"sound_source" text NOT NULL,
	"wave_type" text NOT NULL,
	"frequency" real,
	"volume" real,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"audio_file" text,
	"effects" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mikutap_sound_library" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text NOT NULL,
	"name" text NOT NULL,
	"file" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"size" integer,
	"duration" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mikutap_grid_cells" ADD CONSTRAINT "mikutap_grid_cells_config_id_mikutap_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."mikutap_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mikutap_sound_library" ADD CONSTRAINT "mikutap_sound_library_config_id_mikutap_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."mikutap_configs"("id") ON DELETE cascade ON UPDATE no action;