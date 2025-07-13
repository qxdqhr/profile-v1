-- 通用文件服务数据库表创建脚本
-- 创建时间: 2024-01-20
-- 版本: 0001

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 存储提供者配置表
CREATE TABLE IF NOT EXISTS file_storage_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 100,
  max_file_size BIGINT,
  supported_mime_types JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 存储提供者表索引
CREATE INDEX IF NOT EXISTS storage_providers_type_idx ON file_storage_providers(type);
CREATE INDEX IF NOT EXISTS storage_providers_is_active_idx ON file_storage_providers(is_active);
CREATE INDEX IF NOT EXISTS storage_providers_priority_idx ON file_storage_providers(priority);

-- 2. 文件夹表
CREATE TABLE IF NOT EXISTS file_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID,
  module_id VARCHAR(100),
  business_id VARCHAR(255),
  path TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件夹表外键约束
ALTER TABLE file_folders 
ADD CONSTRAINT file_folders_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES file_folders(id) ON DELETE CASCADE;

-- 文件夹表索引
CREATE INDEX IF NOT EXISTS folders_module_idx ON file_folders(module_id);
CREATE INDEX IF NOT EXISTS folders_business_idx ON file_folders(business_id);
CREATE INDEX IF NOT EXISTS folders_parent_idx ON file_folders(parent_id);
CREATE INDEX IF NOT EXISTS folders_path_idx ON file_folders(path);
CREATE INDEX IF NOT EXISTS folders_module_business_parent_idx ON file_folders(module_id, business_id, parent_id);

-- 3. 文件元数据主表
CREATE TABLE IF NOT EXISTS file_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name VARCHAR(500) NOT NULL,
  stored_name VARCHAR(500) NOT NULL,
  extension VARCHAR(20),
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  md5_hash VARCHAR(32) NOT NULL,
  sha256_hash VARCHAR(64),
  storage_provider_id INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  folder_id UUID,
  module_id VARCHAR(100),
  business_id VARCHAR(255),
  tags JSONB,
  metadata JSONB,
  is_temporary BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  access_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  uploader_id VARCHAR(255) NOT NULL,
  upload_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_access_time TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 文件元数据表外键约束
ALTER TABLE file_metadata 
ADD CONSTRAINT file_metadata_storage_provider_id_fkey 
FOREIGN KEY (storage_provider_id) REFERENCES file_storage_providers(id);

ALTER TABLE file_metadata 
ADD CONSTRAINT file_metadata_folder_id_fkey 
FOREIGN KEY (folder_id) REFERENCES file_folders(id) ON DELETE SET NULL;

-- 文件元数据表索引
CREATE INDEX IF NOT EXISTS file_metadata_md5_idx ON file_metadata(md5_hash);
CREATE INDEX IF NOT EXISTS file_metadata_sha256_idx ON file_metadata(sha256_hash);
CREATE INDEX IF NOT EXISTS file_metadata_module_idx ON file_metadata(module_id);
CREATE INDEX IF NOT EXISTS file_metadata_business_idx ON file_metadata(business_id);
CREATE INDEX IF NOT EXISTS file_metadata_uploader_idx ON file_metadata(uploader_id);
CREATE INDEX IF NOT EXISTS file_metadata_mime_type_idx ON file_metadata(mime_type);
CREATE INDEX IF NOT EXISTS file_metadata_is_deleted_idx ON file_metadata(is_deleted);
CREATE INDEX IF NOT EXISTS file_metadata_is_temporary_idx ON file_metadata(is_temporary);
CREATE INDEX IF NOT EXISTS file_metadata_folder_idx ON file_metadata(folder_id);
CREATE INDEX IF NOT EXISTS file_metadata_upload_time_idx ON file_metadata(upload_time);
CREATE INDEX IF NOT EXISTS file_metadata_module_business_deleted_idx ON file_metadata(module_id, business_id, is_deleted);
CREATE INDEX IF NOT EXISTS file_metadata_folder_deleted_idx ON file_metadata(folder_id, is_deleted);

-- 4. 文件版本表
CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL,
  version INTEGER NOT NULL,
  description TEXT,
  size BIGINT NOT NULL,
  md5_hash VARCHAR(32) NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件版本表外键约束
ALTER TABLE file_versions 
ADD CONSTRAINT file_versions_file_id_fkey 
FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE CASCADE;

-- 文件版本表索引
CREATE INDEX IF NOT EXISTS file_versions_file_idx ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS file_versions_is_current_idx ON file_versions(is_current);
CREATE INDEX IF NOT EXISTS file_versions_file_version_idx ON file_versions(file_id, version);

-- 5. 文件处理记录表
CREATE TABLE IF NOT EXISTS file_processing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL,
  processing_type VARCHAR(50) NOT NULL,
  processor_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  parameters JSONB,
  result JSONB,
  output_path TEXT,
  output_size BIGINT,
  processing_time_ms INTEGER,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 5,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件处理记录表外键约束
ALTER TABLE file_processing_records 
ADD CONSTRAINT file_processing_records_file_id_fkey 
FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE CASCADE;

-- 文件处理记录表索引
CREATE INDEX IF NOT EXISTS file_processing_records_file_idx ON file_processing_records(file_id);
CREATE INDEX IF NOT EXISTS file_processing_records_status_idx ON file_processing_records(status);
CREATE INDEX IF NOT EXISTS file_processing_records_processing_type_idx ON file_processing_records(processing_type);
CREATE INDEX IF NOT EXISTS file_processing_records_priority_idx ON file_processing_records(priority);
CREATE INDEX IF NOT EXISTS file_processing_records_file_processing_type_idx ON file_processing_records(file_id, processing_type);

-- 6. 文件分享表
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_code VARCHAR(20) NOT NULL UNIQUE,
  file_ids JSONB NOT NULL,
  title VARCHAR(255),
  description TEXT,
  password VARCHAR(100),
  permission VARCHAR(20) NOT NULL DEFAULT 'view',
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_access INTEGER,
  access_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件分享表索引
CREATE INDEX IF NOT EXISTS file_shares_share_code_idx ON file_shares(share_code);
CREATE INDEX IF NOT EXISTS file_shares_created_by_idx ON file_shares(created_by);
CREATE INDEX IF NOT EXISTS file_shares_is_active_idx ON file_shares(is_active);
CREATE INDEX IF NOT EXISTS file_shares_expires_at_idx ON file_shares(expires_at);

-- 7. 文件访问日志表
CREATE TABLE IF NOT EXISTS file_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID,
  share_id UUID,
  access_type VARCHAR(20) NOT NULL,
  user_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  status_code INTEGER,
  bytes_transferred BIGINT,
  response_time_ms INTEGER,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件访问日志表外键约束
ALTER TABLE file_access_logs 
ADD CONSTRAINT file_access_logs_file_id_fkey 
FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE CASCADE;

ALTER TABLE file_access_logs 
ADD CONSTRAINT file_access_logs_share_id_fkey 
FOREIGN KEY (share_id) REFERENCES file_shares(id) ON DELETE SET NULL;

-- 文件访问日志表索引
CREATE INDEX IF NOT EXISTS file_access_logs_file_idx ON file_access_logs(file_id);
CREATE INDEX IF NOT EXISTS file_access_logs_user_idx ON file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS file_access_logs_access_type_idx ON file_access_logs(access_type);
CREATE INDEX IF NOT EXISTS file_access_logs_accessed_at_idx ON file_access_logs(accessed_at);
CREATE INDEX IF NOT EXISTS file_access_logs_share_idx ON file_access_logs(share_id);

-- 8. 文件缩略图表
CREATE TABLE IF NOT EXISTS file_thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  size VARCHAR(20) NOT NULL,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  quality INTEGER DEFAULT 85,
  is_generated BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 文件缩略图表外键约束
ALTER TABLE file_thumbnails 
ADD CONSTRAINT file_thumbnails_file_id_fkey 
FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE CASCADE;

-- 文件缩略图表索引
CREATE INDEX IF NOT EXISTS file_thumbnails_file_idx ON file_thumbnails(file_id);
CREATE INDEX IF NOT EXISTS file_thumbnails_type_idx ON file_thumbnails(type);
CREATE INDEX IF NOT EXISTS file_thumbnails_is_generated_idx ON file_thumbnails(is_generated);
CREATE INDEX IF NOT EXISTS file_thumbnails_file_type_size_idx ON file_thumbnails(file_id, type, size);

-- 插入默认存储提供者配置
INSERT INTO file_storage_providers (name, type, config, is_active, is_default, priority) 
VALUES (
  'local_storage',
  'local', 
  '{"uploadPath": "/uploads", "publicPath": "/uploads", "allowedMimeTypes": ["*/*"]}',
  true,
  true,
  1
) ON CONFLICT (name) DO NOTHING;

-- 创建根文件夹
INSERT INTO file_folders (id, name, path, depth, is_system, created_by)
VALUES (
  uuid_generate_v4(),
  'root',
  '/',
  0,
  true,
  'system'
) ON CONFLICT DO NOTHING;

-- 添加约束检查
ALTER TABLE file_metadata 
ADD CONSTRAINT check_file_size_positive 
CHECK (size >= 0);

ALTER TABLE file_metadata 
ADD CONSTRAINT check_access_count_non_negative 
CHECK (access_count >= 0);

ALTER TABLE file_metadata 
ADD CONSTRAINT check_download_count_non_negative 
CHECK (download_count >= 0);

ALTER TABLE file_shares 
ADD CONSTRAINT check_download_count_non_negative 
CHECK (download_count >= 0);

ALTER TABLE file_shares 
ADD CONSTRAINT check_access_count_non_negative 
CHECK (access_count >= 0);

-- 添加触发器以自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表创建触发器
CREATE TRIGGER update_file_storage_providers_updated_at 
  BEFORE UPDATE ON file_storage_providers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_folders_updated_at 
  BEFORE UPDATE ON file_folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_metadata_updated_at 
  BEFORE UPDATE ON file_metadata 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_processing_records_updated_at 
  BEFORE UPDATE ON file_processing_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_shares_updated_at 
  BEFORE UPDATE ON file_shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE file_storage_providers IS '存储提供者配置表';
COMMENT ON TABLE file_folders IS '文件夹表，支持层级结构';
COMMENT ON TABLE file_metadata IS '文件元数据主表';
COMMENT ON TABLE file_versions IS '文件版本表';
COMMENT ON TABLE file_processing_records IS '文件处理记录表';
COMMENT ON TABLE file_shares IS '文件分享表';
COMMENT ON TABLE file_access_logs IS '文件访问日志表';
COMMENT ON TABLE file_thumbnails IS '文件缩略图表'; 