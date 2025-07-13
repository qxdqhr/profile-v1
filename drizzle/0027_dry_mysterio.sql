CREATE TABLE "file_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid,
	"share_id" uuid,
	"access_type" varchar(20) NOT NULL,
	"user_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"referer" text,
	"status_code" integer,
	"bytes_transferred" bigint,
	"response_time_ms" integer,
	"accessed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"module_id" varchar(100),
	"business_id" varchar(255),
	"path" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_name" varchar(500) NOT NULL,
	"stored_name" varchar(500) NOT NULL,
	"extension" varchar(20),
	"mime_type" varchar(100) NOT NULL,
	"size" bigint NOT NULL,
	"md5_hash" varchar(32) NOT NULL,
	"sha256_hash" varchar(64),
	"storage_provider_id" integer NOT NULL,
	"storage_path" text NOT NULL,
	"cdn_url" text,
	"folder_id" uuid,
	"module_id" varchar(100),
	"business_id" varchar(255),
	"tags" json,
	"metadata" json,
	"is_temporary" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"access_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"uploader_id" varchar(255) NOT NULL,
	"upload_time" timestamp DEFAULT now() NOT NULL,
	"last_access_time" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "file_processing_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"processing_type" varchar(50) NOT NULL,
	"processor_name" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"parameters" json,
	"result" json,
	"output_path" text,
	"output_size" bigint,
	"processing_time_ms" integer,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_code" varchar(20) NOT NULL,
	"file_ids" json NOT NULL,
	"title" varchar(255),
	"description" text,
	"password" varchar(100),
	"permission" varchar(20) DEFAULT 'view' NOT NULL,
	"max_downloads" integer,
	"download_count" integer DEFAULT 0 NOT NULL,
	"max_access" integer,
	"access_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_shares_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "file_storage_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"config" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"max_file_size" bigint,
	"supported_mime_types" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_storage_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "file_thumbnails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" varchar(20) NOT NULL,
	"width" integer,
	"height" integer,
	"format" varchar(10) NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"cdn_url" text,
	"quality" integer DEFAULT 85,
	"is_generated" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"description" text,
	"size" bigint NOT NULL,
	"md5_hash" varchar(32) NOT NULL,
	"storage_path" text NOT NULL,
	"cdn_url" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_access_logs" ADD CONSTRAINT "file_access_logs_file_id_file_metadata_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_access_logs" ADD CONSTRAINT "file_access_logs_share_id_file_shares_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."file_shares"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_storage_provider_id_file_storage_providers_id_fk" FOREIGN KEY ("storage_provider_id") REFERENCES "public"."file_storage_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_folder_id_file_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."file_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_processing_records" ADD CONSTRAINT "file_processing_records_file_id_file_metadata_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_thumbnails" ADD CONSTRAINT "file_thumbnails_file_id_file_metadata_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_file_metadata_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_access_logs_file_idx" ON "file_access_logs" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_access_logs_user_idx" ON "file_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_access_logs_access_type_idx" ON "file_access_logs" USING btree ("access_type");--> statement-breakpoint
CREATE INDEX "file_access_logs_accessed_at_idx" ON "file_access_logs" USING btree ("accessed_at");--> statement-breakpoint
CREATE INDEX "file_access_logs_share_idx" ON "file_access_logs" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "folders_module_idx" ON "file_folders" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "folders_business_idx" ON "file_folders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "folders_parent_idx" ON "file_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "folders_path_idx" ON "file_folders" USING btree ("path");--> statement-breakpoint
CREATE INDEX "folders_module_business_parent_idx" ON "file_folders" USING btree ("module_id","business_id","parent_id");--> statement-breakpoint
CREATE INDEX "file_metadata_md5_idx" ON "file_metadata" USING btree ("md5_hash");--> statement-breakpoint
CREATE INDEX "file_metadata_sha256_idx" ON "file_metadata" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "file_metadata_module_idx" ON "file_metadata" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "file_metadata_business_idx" ON "file_metadata" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "file_metadata_uploader_idx" ON "file_metadata" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "file_metadata_mime_type_idx" ON "file_metadata" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "file_metadata_is_deleted_idx" ON "file_metadata" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "file_metadata_is_temporary_idx" ON "file_metadata" USING btree ("is_temporary");--> statement-breakpoint
CREATE INDEX "file_metadata_folder_idx" ON "file_metadata" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "file_metadata_upload_time_idx" ON "file_metadata" USING btree ("upload_time");--> statement-breakpoint
CREATE INDEX "file_metadata_module_business_deleted_idx" ON "file_metadata" USING btree ("module_id","business_id","is_deleted");--> statement-breakpoint
CREATE INDEX "file_metadata_folder_deleted_idx" ON "file_metadata" USING btree ("folder_id","is_deleted");--> statement-breakpoint
CREATE INDEX "file_processing_records_file_idx" ON "file_processing_records" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_processing_records_status_idx" ON "file_processing_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "file_processing_records_processing_type_idx" ON "file_processing_records" USING btree ("processing_type");--> statement-breakpoint
CREATE INDEX "file_processing_records_priority_idx" ON "file_processing_records" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "file_processing_records_file_processing_type_idx" ON "file_processing_records" USING btree ("file_id","processing_type");--> statement-breakpoint
CREATE INDEX "file_shares_share_code_idx" ON "file_shares" USING btree ("share_code");--> statement-breakpoint
CREATE INDEX "file_shares_created_by_idx" ON "file_shares" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "file_shares_is_active_idx" ON "file_shares" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "file_shares_expires_at_idx" ON "file_shares" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "storage_providers_type_idx" ON "file_storage_providers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "storage_providers_is_active_idx" ON "file_storage_providers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "storage_providers_priority_idx" ON "file_storage_providers" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "file_thumbnails_file_idx" ON "file_thumbnails" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_thumbnails_type_idx" ON "file_thumbnails" USING btree ("type");--> statement-breakpoint
CREATE INDEX "file_thumbnails_is_generated_idx" ON "file_thumbnails" USING btree ("is_generated");--> statement-breakpoint
CREATE INDEX "file_thumbnails_file_type_size_idx" ON "file_thumbnails" USING btree ("file_id","type","size");--> statement-breakpoint
CREATE INDEX "file_versions_file_idx" ON "file_versions" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_versions_is_current_idx" ON "file_versions" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "file_versions_file_version_idx" ON "file_versions" USING btree ("file_id","version");