CREATE TABLE "mmd_animation_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"animation_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mmd_animations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"file_path" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"duration" real NOT NULL,
	"frame_count" integer NOT NULL,
	"upload_time" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"tags" json,
	"is_public" boolean DEFAULT false NOT NULL,
	"compatible_models" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mmd_audios" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"duration" real NOT NULL,
	"format" varchar(10) NOT NULL,
	"upload_time" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mmd_model_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mmd_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"file_path" varchar(500) NOT NULL,
	"thumbnail_path" varchar(500),
	"file_size" integer NOT NULL,
	"format" varchar(10) NOT NULL,
	"upload_time" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"tags" json,
	"is_public" boolean DEFAULT false NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mmd_scenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"model_id" integer NOT NULL,
	"animation_id" integer,
	"audio_id" integer,
	"camera_position" json NOT NULL,
	"camera_target" json NOT NULL,
	"lighting" json NOT NULL,
	"background" json NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mmd_animation_favorites" ADD CONSTRAINT "mmd_animation_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_animation_favorites" ADD CONSTRAINT "mmd_animation_favorites_animation_id_mmd_animations_id_fk" FOREIGN KEY ("animation_id") REFERENCES "public"."mmd_animations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_animations" ADD CONSTRAINT "mmd_animations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_audios" ADD CONSTRAINT "mmd_audios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_model_favorites" ADD CONSTRAINT "mmd_model_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_model_favorites" ADD CONSTRAINT "mmd_model_favorites_model_id_mmd_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."mmd_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_models" ADD CONSTRAINT "mmd_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_scenes" ADD CONSTRAINT "mmd_scenes_model_id_mmd_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."mmd_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_scenes" ADD CONSTRAINT "mmd_scenes_animation_id_mmd_animations_id_fk" FOREIGN KEY ("animation_id") REFERENCES "public"."mmd_animations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_scenes" ADD CONSTRAINT "mmd_scenes_audio_id_mmd_audios_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."mmd_audios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mmd_scenes" ADD CONSTRAINT "mmd_scenes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;