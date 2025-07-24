DROP INDEX "bookings_user_id_idx";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'comic_universe_bookings'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "comic_universe_bookings" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ALTER COLUMN "phone_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" ADD CONSTRAINT "comic_universe_bookings_qq_number_phone_number_collection_id_pk" PRIMARY KEY("qq_number","phone_number","collection_id");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "comic_universe_bookings" USING btree ("qq_number","phone_number");--> statement-breakpoint
CREATE INDEX "bookings_user_status_idx" ON "comic_universe_bookings" USING btree ("qq_number","phone_number","status");--> statement-breakpoint
ALTER TABLE "comic_universe_bookings" DROP COLUMN "user_id";