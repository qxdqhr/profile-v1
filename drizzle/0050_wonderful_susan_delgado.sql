CREATE TABLE "showmaster_event_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"site_name" varchar(255) DEFAULT '画集展览' NOT NULL,
	"site_description" text DEFAULT '精美的艺术作品展览',
	"hero_title" varchar(255) DEFAULT '艺术画集展览' NOT NULL,
	"hero_subtitle" text DEFAULT '探索精美的艺术作品，感受创作的魅力',
	"max_collections_per_page" integer DEFAULT 9 NOT NULL,
	"enable_search" boolean DEFAULT true NOT NULL,
	"enable_categories" boolean DEFAULT true NOT NULL,
	"default_category" varchar(100) DEFAULT 'all' NOT NULL,
	"theme" varchar(20) DEFAULT 'light' NOT NULL,
	"language" varchar(10) DEFAULT 'zh' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showmaster_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "showmaster_events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "popup_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" integer,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'deadline' NOT NULL,
	"enabled" boolean DEFAULT false,
	"trigger_config" jsonb NOT NULL,
	"content_config" jsonb NOT NULL,
	"display_config" jsonb,
	"block_process" boolean DEFAULT false,
	"business_module" text DEFAULT 'showmasterpiece' NOT NULL,
	"business_scene" text DEFAULT 'cart_checkout' NOT NULL,
	"sort_order" text DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "showmaster_config_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "showmaster_config_history" (
	"id" text PRIMARY KEY NOT NULL,
	"config_item_id" text,
	"old_value" text,
	"new_value" text,
	"changed_by" text NOT NULL,
	"change_reason" text,
	"operation_type" text NOT NULL,
	"environment" text DEFAULT 'development',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "showmaster_config_items" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"key" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"value" text,
	"default_value" text,
	"type" text NOT NULL,
	"is_required" boolean DEFAULT false,
	"is_sensitive" boolean DEFAULT false,
	"validation" jsonb,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"environment" text DEFAULT 'development',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "showmaster_config_items_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "showmaster_config_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text,
	"can_read" boolean DEFAULT true,
	"can_write" boolean DEFAULT false,
	"can_delete" boolean DEFAULT false,
	"allowed_environments" jsonb DEFAULT '["development"]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" DROP CONSTRAINT "comic_universe_bookings_qq_number_phone_number_collection_id_pk";--> statement-breakpoint
ALTER TABLE "comic_universe_categories" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "comic_universe_collections" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "comic_universe_tags" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "export_configs" ADD COLUMN "grouping" jsonb;--> statement-breakpoint
ALTER TABLE "showmaster_event_configs" ADD CONSTRAINT "showmaster_event_configs_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_configs" ADD CONSTRAINT "popup_configs_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showmaster_config_history" ADD CONSTRAINT "showmaster_config_history_config_item_id_showmaster_config_items_id_fk" FOREIGN KEY ("config_item_id") REFERENCES "public"."showmaster_config_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showmaster_config_items" ADD CONSTRAINT "showmaster_config_items_category_id_showmaster_config_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."showmaster_config_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showmaster_config_permissions" ADD CONSTRAINT "showmaster_config_permissions_category_id_showmaster_config_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."showmaster_config_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_configs_event_id_unique_idx" ON "showmaster_event_configs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "showmaster_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_sort_order_idx" ON "showmaster_events" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "events_is_default_idx" ON "showmaster_events" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "events_slug_unique_idx" ON "showmaster_events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "popup_configs_event_id_idx" ON "popup_configs" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "comic_universe_categories" ADD CONSTRAINT "comic_universe_categories_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_collections" ADD CONSTRAINT "comic_universe_collections_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_tags" ADD CONSTRAINT "comic_universe_tags_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD CONSTRAINT "comic_universe_bookings_event_id_showmaster_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."showmaster_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_event_id_idx" ON "comic_universe_categories" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "collections_event_id_idx" ON "comic_universe_collections" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "collections_event_published_order_idx" ON "comic_universe_collections" USING btree ("event_id","is_published","display_order");--> statement-breakpoint
CREATE INDEX "tags_event_id_idx" ON "comic_universe_tags" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "bookings_event_id_idx" ON "comic_universe_bookings" USING btree ("event_id");