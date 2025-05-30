CREATE TABLE "comic_universe_artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"image" text NOT NULL,
	"description" text,
	"year" varchar(20),
	"medium" varchar(255),
	"dimensions" varchar(100),
	"page_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comic_universe_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comic_universe_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "comic_universe_collection_tags" (
	"collection_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comic_universe_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"cover_image" text NOT NULL,
	"description" text,
	"category_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"display_order" integer DEFAULT 0,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comic_universe_configs" (
	"id" serial PRIMARY KEY NOT NULL,
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
CREATE TABLE "comic_universe_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#3b82f6',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comic_universe_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" ADD CONSTRAINT "comic_universe_artworks_collection_id_comic_universe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."comic_universe_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_collection_tags" ADD CONSTRAINT "comic_universe_collection_tags_collection_id_comic_universe_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."comic_universe_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_collection_tags" ADD CONSTRAINT "comic_universe_collection_tags_tag_id_comic_universe_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."comic_universe_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic_universe_collections" ADD CONSTRAINT "comic_universe_collections_category_id_comic_universe_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."comic_universe_categories"("id") ON DELETE set null ON UPDATE no action;