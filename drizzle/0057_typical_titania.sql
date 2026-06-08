CREATE TABLE "fitness_daily_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"checkin_date" date NOT NULL,
	"type" varchar(16) NOT NULL,
	"ref_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_diet_log_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"diet_log_id" integer NOT NULL,
	"meal_type" varchar(16) NOT NULL,
	"food_name" varchar(120) NOT NULL,
	"food_item_id" integer,
	"calories" integer NOT NULL,
	"protein" numeric(6, 2),
	"carbs" numeric(6, 2),
	"fat" numeric(6, 2),
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_diet_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"log_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(120) NOT NULL,
	"type" varchar(16) NOT NULL,
	"body_part" varchar(32),
	"equipment" varchar(32),
	"cardio_type" varchar(32),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"goal" varchar(32) DEFAULT 'maintain' NOT NULL,
	"current_weight" numeric(6, 2),
	"weight_unit" varchar(8) DEFAULT 'kg' NOT NULL,
	"daily_calorie_goal" integer DEFAULT 2000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fitness_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "fitness_food_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(120) NOT NULL,
	"calories" integer NOT NULL,
	"protein" numeric(6, 2),
	"carbs" numeric(6, 2),
	"fat" numeric(6, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_schedule_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"schedule_date" date NOT NULL,
	"plan_id" integer,
	"is_rest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_schedule_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cycle_weeks" integer DEFAULT 4 NOT NULL,
	"week_pattern" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"target_sets" integer,
	"target_reps" integer,
	"target_weight" numeric(8, 2),
	"rest_seconds" integer DEFAULT 90,
	"target_duration_minutes" integer,
	"target_distance" numeric(8, 2),
	"target_calories" integer
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"goal_tags" json DEFAULT '[]'::json,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"source_template_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_session_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer,
	"status" varchar(16) DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_seconds" integer,
	"notes" text,
	"summary_json" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_item_id" integer NOT NULL,
	"set_number" integer NOT NULL,
	"weight" numeric(8, 2),
	"reps" integer,
	"duration_minutes" integer,
	"distance" numeric(8, 2),
	"calories" integer,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fitness_daily_checkins" ADD CONSTRAINT "fitness_daily_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_diet_log_entries" ADD CONSTRAINT "fitness_diet_log_entries_diet_log_id_fitness_diet_logs_id_fk" FOREIGN KEY ("diet_log_id") REFERENCES "public"."fitness_diet_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_diet_log_entries" ADD CONSTRAINT "fitness_diet_log_entries_food_item_id_fitness_food_items_id_fk" FOREIGN KEY ("food_item_id") REFERENCES "public"."fitness_food_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_diet_logs" ADD CONSTRAINT "fitness_diet_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_exercises" ADD CONSTRAINT "fitness_exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_profiles" ADD CONSTRAINT "fitness_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_food_items" ADD CONSTRAINT "fitness_food_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_schedule_overrides" ADD CONSTRAINT "fitness_schedule_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_schedule_overrides" ADD CONSTRAINT "fitness_schedule_overrides_plan_id_fitness_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fitness_workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_schedule_templates" ADD CONSTRAINT "fitness_schedule_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_plan_items" ADD CONSTRAINT "fitness_workout_plan_items_plan_id_fitness_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fitness_workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_plan_items" ADD CONSTRAINT "fitness_workout_plan_items_exercise_id_fitness_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."fitness_exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_plans" ADD CONSTRAINT "fitness_workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_session_items" ADD CONSTRAINT "fitness_workout_session_items_session_id_fitness_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."fitness_workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_session_items" ADD CONSTRAINT "fitness_workout_session_items_exercise_id_fitness_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."fitness_exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_sessions" ADD CONSTRAINT "fitness_workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_sessions" ADD CONSTRAINT "fitness_workout_sessions_plan_id_fitness_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."fitness_workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_sets" ADD CONSTRAINT "fitness_workout_sets_session_item_id_fitness_workout_session_items_id_fk" FOREIGN KEY ("session_item_id") REFERENCES "public"."fitness_workout_session_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fitness_daily_checkins_user_date_type" ON "fitness_daily_checkins" USING btree ("user_id","checkin_date","type");--> statement-breakpoint
CREATE UNIQUE INDEX "fitness_diet_logs_user_date" ON "fitness_diet_logs" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE UNIQUE INDEX "fitness_schedule_overrides_user_date" ON "fitness_schedule_overrides" USING btree ("user_id","schedule_date");