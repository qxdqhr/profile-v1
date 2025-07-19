CREATE TABLE "config_categories" (
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
CREATE TABLE "config_history" (
	"id" text PRIMARY KEY NOT NULL,
	"config_item_id" text,
	"old_value" text,
	"new_value" text,
	"changed_by" text NOT NULL,
	"change_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "config_items" (
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "config_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text,
	"can_read" boolean DEFAULT false,
	"can_write" boolean DEFAULT false,
	"can_delete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "config_history" ADD CONSTRAINT "config_history_config_item_id_config_items_id_fk" FOREIGN KEY ("config_item_id") REFERENCES "public"."config_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_items" ADD CONSTRAINT "config_items_category_id_config_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."config_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_permissions" ADD CONSTRAINT "config_permissions_category_id_config_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."config_categories"("id") ON DELETE no action ON UPDATE no action;