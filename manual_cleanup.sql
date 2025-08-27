-- 手动清理微信相关列的SQL脚本
-- 本脚本用于解决数据库迁移冲突问题

-- 1. 删除 users 表中的微信相关列
ALTER TABLE users DROP COLUMN IF EXISTS wechat_openid;
ALTER TABLE users DROP COLUMN IF EXISTS wechat_unionid;
ALTER TABLE users DROP COLUMN IF EXISTS wechat_nickname;
ALTER TABLE users DROP COLUMN IF EXISTS wechat_avatar;
ALTER TABLE users DROP COLUMN IF EXISTS login_type;

-- 2. 处理 phone 列的空值问题
-- 先将空值设置为默认值或删除包含空值的记录
UPDATE users SET phone = '' WHERE phone IS NULL;

-- 或者如果你想删除没有手机号的用户记录，使用以下语句（谨慎使用）：
-- DELETE FROM users WHERE phone IS NULL;

-- 3. 删除可能存在的微信登录相关表
DROP TABLE IF EXISTS wechat_qr_logins;

-- 4. 为 showmasterpiece 模块添加新的 pickup_method 列（如果还没有的话）
ALTER TABLE comic_universe_bookings ADD COLUMN IF NOT EXISTS pickup_method text;

-- 5. 删除旧的 is_pickup_on_site 列（如果存在）
ALTER TABLE comic_universe_bookings DROP COLUMN IF EXISTS is_pickup_on_site;

-- 完成清理
SELECT 'Database cleanup completed successfully!' as status;




