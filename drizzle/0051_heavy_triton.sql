CREATE TABLE "festival_card_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "showmaster_event_configs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "showmaster_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "showmaster_event_configs" CASCADE;--> statement-breakpoint
DROP TABLE "showmaster_events" CASCADE;--> statement-breakpoint
ALTER TABLE "comic_universe_categories" DROP CONSTRAINT "comic_universe_categories_event_id_showmaster_events_id_fk";
--> statement-breakpoint
ALTER TABLE "comic_universe_collections" DROP CONSTRAINT "comic_universe_collections_event_id_showmaster_events_id_fk";
--> statement-breakpoint
ALTER TABLE "comic_universe_tags" DROP CONSTRAINT "comic_universe_tags_event_id_showmaster_events_id_fk";
--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" DROP CONSTRAINT "comic_universe_bookings_event_id_showmaster_events_id_fk";
--> statement-breakpoint
ALTER TABLE "popup_configs" DROP CONSTRAINT "popup_configs_event_id_showmaster_events_id_fk";
--> statement-breakpoint
DROP INDEX "categories_event_id_idx";--> statement-breakpoint
DROP INDEX "collections_event_id_idx";--> statement-breakpoint
DROP INDEX "collections_event_published_order_idx";--> statement-breakpoint
DROP INDEX "tags_event_id_idx";--> statement-breakpoint
DROP INDEX "bookings_event_id_idx";--> statement-breakpoint
DROP INDEX "popup_configs_event_id_idx";--> statement-breakpoint
ALTER TABLE "comic_universe_configs" ADD COLUMN "home_tab_config" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "comic_universe_categories" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "comic_universe_collections" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "comic_universe_tags" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "popup_configs" DROP COLUMN "event_id";