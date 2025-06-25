ALTER TABLE "mikutap_grid_cells" ADD COLUMN "animation_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "mikutap_grid_cells" ADD COLUMN "animation_type" text DEFAULT 'pulse' NOT NULL;--> statement-breakpoint
ALTER TABLE "mikutap_grid_cells" ADD COLUMN "animation_data" json;--> statement-breakpoint
ALTER TABLE "mikutap_grid_cells" ADD COLUMN "animation_config" json;