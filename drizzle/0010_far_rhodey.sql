CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "thumbnail_small";--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "thumbnail_medium";--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "thumbnail_large";--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "image_width";--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "image_height";--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" DROP COLUMN "file_size";