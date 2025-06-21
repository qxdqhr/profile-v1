CREATE TABLE "calendar_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_day_of_week" integer DEFAULT 1 NOT NULL,
	"working_hours_start" varchar(5) DEFAULT '09:00' NOT NULL,
	"working_hours_end" varchar(5) DEFAULT '18:00' NOT NULL,
	"time_zone" varchar(50) DEFAULT 'Asia/Shanghai' NOT NULL,
	"date_format" varchar(20) DEFAULT 'YYYY-MM-DD' NOT NULL,
	"time_format" varchar(20) DEFAULT 'HH:mm' NOT NULL,
	"default_view" varchar(20) DEFAULT 'month' NOT NULL,
	"default_event_color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"weekends" boolean DEFAULT true NOT NULL,
	"event_colors" json DEFAULT '{"blue":"#3B82F6","green":"#10B981","purple":"#8B5CF6","red":"#EF4444","yellow":"#F59E0B","pink":"#EC4899","indigo":"#6366F1","gray":"#6B7280"}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_configs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"location" varchar(500),
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"shared_with_user_id" integer NOT NULL,
	"shared_by_user_id" integer NOT NULL,
	"permission" varchar(20) DEFAULT 'read' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurrence_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"rule_type" varchar(20) NOT NULL,
	"interval" integer DEFAULT 1 NOT NULL,
	"end_date" timestamp,
	"count" integer,
	"by_weekday" json,
	"by_monthday" json,
	"by_month" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"reminder_time" timestamp NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_configs" ADD CONSTRAINT "calendar_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_shares" ADD CONSTRAINT "event_shares_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_shares" ADD CONSTRAINT "event_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_shares" ADD CONSTRAINT "event_shares_shared_by_user_id_users_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrence_rules" ADD CONSTRAINT "recurrence_rules_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;