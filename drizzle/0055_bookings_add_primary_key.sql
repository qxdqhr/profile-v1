-- 为 comic_universe_bookings.id 补充主键约束
-- 历史原因：0036 迁移在添加复合主键时，DROP 旧 PK 那行被注释掉；
--           后来复合 PK 也被移除，导致表最终没有任何主键。
-- 此迁移恢复正确状态：id serial 作为主键。
ALTER TABLE "comic_universe_bookings" ADD CONSTRAINT "comic_universe_bookings_pkey" PRIMARY KEY ("id");
