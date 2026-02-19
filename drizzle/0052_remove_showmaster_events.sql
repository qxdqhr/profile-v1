ALTER TABLE "comic_universe_categories" DROP COLUMN IF EXISTS "event_id";
ALTER TABLE "comic_universe_tags" DROP COLUMN IF EXISTS "event_id";
ALTER TABLE "comic_universe_collections" DROP COLUMN IF EXISTS "event_id";
ALTER TABLE "comic_universe_bookings" DROP COLUMN IF EXISTS "event_id";
ALTER TABLE "popup_configs" DROP COLUMN IF EXISTS "event_id";

DROP TABLE IF EXISTS "showmaster_event_configs";
DROP TABLE IF EXISTS "showmaster_events";
