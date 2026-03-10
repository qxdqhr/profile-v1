CREATE TABLE "vocaloid_booth_records" (
	"id" text PRIMARY KEY NOT NULL,
	"match_code" text NOT NULL,
	"booth_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"files" jsonb NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vocaloid_booth_records_match_code_unique" UNIQUE("match_code")
);
--> statement-breakpoint
CREATE INDEX "idx_vocaloid_booth_records_match_code" ON "vocaloid_booth_records" USING btree ("match_code");--> statement-breakpoint
CREATE INDEX "idx_vocaloid_booth_records_booth_id" ON "vocaloid_booth_records" USING btree ("booth_id");--> statement-breakpoint
CREATE INDEX "idx_vocaloid_booth_records_expires_at" ON "vocaloid_booth_records" USING btree ("expires_at");