/**
 * 将现有的预订和弹窗配置数据迁移到多期活动架构
 * 
 * 这个脚本将：
 * 1. 为所有现有预订添加event_id，关联到默认活动
 * 2. 为所有现有弹窗配置添加event_id，关联到默认活动
 */

import { db } from '@/db';
import {
  showmasterEvents,
  comicUniverseBookings,
  popupConfigs
} from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function migrateBookingsAndPopupsToEvents() {
  console.log('🚀 开始将预订和弹窗配置迁移到多期活动架构...');

  try {
    // 1. 获取默认活动
    console.log('📋 1. 查找默认活动...');
    const defaultEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.isDefault, true))
      .limit(1);

    if (defaultEvents.length === 0) {
      console.error('❌ 未找到默认活动！请先运行多期活动迁移脚本。');
      process.exit(1);
    }

    const defaultEvent = defaultEvents[0];
    console.log('✅ 找到默认活动:', {
      id: defaultEvent.id,
      name: defaultEvent.displayName,
      slug: defaultEvent.slug
    });

    // 2. 迁移预订数据
    console.log('📚 2. 迁移预订数据到默认活动...');
    
    // 检查有多少预订需要迁移
    const bookingsToMigrate = await db.select()
      .from(comicUniverseBookings)
      .where(isNull(comicUniverseBookings.eventId));
    
    console.log(`📊 发现 ${bookingsToMigrate.length} 个预订需要迁移`);
    
    if (bookingsToMigrate.length > 0) {
      const migratedBookings = await db.update(comicUniverseBookings)
        .set({ eventId: defaultEvent.id })
        .where(isNull(comicUniverseBookings.eventId))
        .returning({ id: comicUniverseBookings.id });
      
      console.log(`✅ 成功迁移 ${migratedBookings.length} 个预订到默认活动`);
    } else {
      console.log('✅ 所有预订已关联到活动，跳过迁移');
    }

    // 3. 迁移弹窗配置数据
    console.log('🔔 3. 迁移弹窗配置到默认活动...');
    
    // 检查有多少弹窗配置需要迁移
    const popupsToMigrate = await db.select()
      .from(popupConfigs)
      .where(isNull(popupConfigs.eventId));
    
    console.log(`📊 发现 ${popupsToMigrate.length} 个弹窗配置需要迁移`);
    
    if (popupsToMigrate.length > 0) {
      const migratedPopups = await db.update(popupConfigs)
        .set({ eventId: defaultEvent.id })
        .where(isNull(popupConfigs.eventId))
        .returning({ id: popupConfigs.id });
      
      console.log(`✅ 成功迁移 ${migratedPopups.length} 个弹窗配置到默认活动`);
    } else {
      console.log('✅ 所有弹窗配置已关联到活动，跳过迁移');
    }

    // 4. 验证迁移结果
    console.log('🔍 4. 验证迁移结果...');
    
    const totalBookings = await db.select().from(comicUniverseBookings);
    const bookingsWithEvent = await db.select()
      .from(comicUniverseBookings)
      .where(eq(comicUniverseBookings.eventId, defaultEvent.id));
    
    const totalPopups = await db.select().from(popupConfigs);
    const popupsWithEvent = await db.select()
      .from(popupConfigs)
      .where(eq(popupConfigs.eventId, defaultEvent.id));
    
    console.log('📊 迁移摘要:');
    console.log(`   - 默认活动ID: ${defaultEvent.id}`);
    console.log(`   - 预订记录总数: ${totalBookings.length}`);
    console.log(`   - 已关联活动的预订数: ${bookingsWithEvent.length}`);
    console.log(`   - 弹窗配置总数: ${totalPopups.length}`);
    console.log(`   - 已关联活动的弹窗配置数: ${popupsWithEvent.length}`);
    
    if (totalBookings.length === bookingsWithEvent.length && 
        totalPopups.length === popupsWithEvent.length) {
      console.log('✅ 所有数据已成功关联到活动');
    } else {
      console.log('⚠️ 部分数据未关联到活动，请检查');
    }

    console.log('🎉 预订和弹窗配置迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 运行迁移
migrateBookingsAndPopupsToEvents()
  .then(() => {
    console.log('🎊 预订和弹窗配置多期活动架构升级完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 迁移过程中发生错误:', error);
    process.exit(1);
  });
