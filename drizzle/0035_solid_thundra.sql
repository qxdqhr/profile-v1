ALTER TABLE "comic_universe_bookings" ADD COLUMN "user_id" integer;--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "comic_universe_bookings" USING btree ("user_id");