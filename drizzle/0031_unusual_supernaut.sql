CREATE TABLE "comic_universe_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"qq_number" varchar(20) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comic_universe_cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"collection_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comic_universe_carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"is_expired" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comic_universe_collections" ADD COLUMN "cover_image_file_id" uuid;--> statement-breakpoint
ALTER TABLE "comic_universe_collections" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD CONSTRAINT "comic_universe_bookings_collection_id_comic_universe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."comic_universe_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_cart_items" ADD CONSTRAINT "comic_universe_cart_items_cart_id_comic_universe_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."comic_universe_carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_cart_items" ADD CONSTRAINT "comic_universe_cart_items_collection_id_comic_universe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."comic_universe_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_collection_id_idx" ON "comic_universe_bookings" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "comic_universe_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_qq_number_idx" ON "comic_universe_bookings" USING btree ("qq_number");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "comic_universe_bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bookings_collection_status_idx" ON "comic_universe_bookings" USING btree ("collection_id","status");--> statement-breakpoint
CREATE INDEX "bookings_qq_status_idx" ON "comic_universe_bookings" USING btree ("qq_number","status");--> statement-breakpoint
CREATE INDEX "collections_cover_image_file_id_idx" ON "comic_universe_collections" USING btree ("cover_image_file_id");