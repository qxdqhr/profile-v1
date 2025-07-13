ALTER TABLE "comic_universe_artworks" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" ADD COLUMN "file_id" uuid;--> statement-breakpoint
ALTER TABLE "comic_universe_artworks" ADD COLUMN "migration_status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
CREATE INDEX "artworks_file_id_idx" ON "comic_universe_artworks" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "artworks_migration_status_idx" ON "comic_universe_artworks" USING btree ("migration_status");