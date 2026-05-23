CREATE TABLE "ticket_monitor_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"notifications_enabled" boolean DEFAULT false NOT NULL,
	"feishu_webhook_url" text,
	"feishu_sign_secret" text,
	"new_event_enabled" boolean DEFAULT true NOT NULL,
	"new_event_platforms" jsonb DEFAULT '["asobistore"]'::jsonb NOT NULL,
	"ending_soon_enabled" boolean DEFAULT true NOT NULL,
	"ending_soon_days_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_monitor_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(128) NOT NULL,
	"source" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"reception_title" text,
	"seat_info" text,
	"ticket_open_at" timestamp with time zone NOT NULL,
	"ticket_end_at" timestamp with time zone,
	"status" varchar(16) NOT NULL,
	"event_url" text NOT NULL,
	"cover_image" text,
	"location" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"content_hash" varchar(64) NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_monitor_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_monitor_notify_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(128),
	"trigger_type" varchar(32) NOT NULL,
	"dedupe_key" varchar(256) NOT NULL,
	"source" varchar(32),
	"title" text,
	"payload" jsonb,
	"feishu_status" varchar(16) NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_monitor_notify_logs_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "ticket_monitor_sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"duration_ms" integer,
	"sources_total" integer DEFAULT 0 NOT NULL,
	"sources_failed" integer DEFAULT 0 NOT NULL,
	"events_upserted" integer DEFAULT 0 NOT NULL,
	"new_events_found" integer DEFAULT 0 NOT NULL,
	"ending_soon_triggered" integer DEFAULT 0 NOT NULL,
	"notifications_sent" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(16) DEFAULT 'running' NOT NULL
);
