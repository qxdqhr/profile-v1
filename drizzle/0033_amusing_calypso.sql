ALTER TABLE "comic_universe_bookings" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
CREATE INDEX "bookings_phone_number_idx" ON "comic_universe_bookings" USING btree ("phone_number");