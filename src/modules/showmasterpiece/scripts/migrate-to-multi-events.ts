/**
 * ShowMasterpiece 多期活动数据迁移脚本
 * 
 * 这个脚本负责将现有的单期活动数据迁移到新的多期活动架构中。
 * 包括创建第一期活动记录，将现有数据关联到第一期活动，
 * 并迁移配置数据到新的活动配置表。
 * 
 * 使用方法：
 * pnpm run migrate:multi-events
 */

import { db } from '@/db';
import { 
  showmasterEvents, 
  showmasterEventConfigs,
  comicUniverseCategories,
  comicUniverseTags,
  comicUniverseCollections,
  comicUniverseConfigs
} from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

/**
 * 执行数据迁移
 */
async function migrateToMultiEvents() {
  console.log('🚀 开始执行多期活动数据迁移...');
  
  try {
    // 第一步：检查是否已经存在第一期活动
    console.log('📋 1. 检查是否已存在第一期活动...');
    const existingEvent = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.slug, 'event-1'))
      .limit(1);

    let firstEventId: number;

    if (existingEvent.length > 0) {
      console.log('✅ 第一期活动已存在，跳过创建');
      firstEventId = existingEvent[0].id;
    } else {
      // 第二步：创建第一期活动记录
      console.log('📝 2. 创建第一期活动记录...');
      const [firstEvent] = await db.insert(showmasterEvents).values({
        name: '第一期活动',
        slug: 'event-1',
        displayName: '第一期美术作品展',
        description: '第一期美术作品展览活动，展示精美的艺术作品',
        status: 'active',
        isDefault: true,
        sortOrder: 1,
        config: {
          themeColor: '#3b82f6',
          features: {
            enableBooking: true,
            enableCart: true,
            enablePopup: true
          }
        }
      }).returning({ id: showmasterEvents.id });

      firstEventId = firstEvent.id;
      console.log(`✅ 第一期活动创建成功，ID: ${firstEventId}`);
    }

    // 第三步：迁移现有配置到活动配置表
    console.log('⚙️ 3. 迁移现有配置到活动配置表...');
    
    // 检查是否已经存在活动配置
    const existingConfig = await db.select()
      .from(showmasterEventConfigs)
      .where(eq(showmasterEventConfigs.eventId, firstEventId))
      .limit(1);

    if (existingConfig.length === 0) {
      // 获取现有的全局配置
      const globalConfigs = await db.select().from(comicUniverseConfigs).limit(1);
      
      if (globalConfigs.length > 0) {
        const globalConfig = globalConfigs[0];
        
        // 创建活动特定配置
        await db.insert(showmasterEventConfigs).values({
          eventId: firstEventId,
          siteName: globalConfig.siteName,
          siteDescription: globalConfig.siteDescription || '',
          heroTitle: globalConfig.heroTitle,
          heroSubtitle: globalConfig.heroSubtitle || '',
          maxCollectionsPerPage: globalConfig.maxCollectionsPerPage,
          enableSearch: globalConfig.enableSearch,
          enableCategories: globalConfig.enableCategories,
          defaultCategory: globalConfig.defaultCategory,
          theme: globalConfig.theme,
          language: globalConfig.language,
        });
        
        console.log('✅ 配置迁移成功');
      } else {
        // 如果没有全局配置，创建默认配置
        await db.insert(showmasterEventConfigs).values({
          eventId: firstEventId,
          siteName: '画集展览',
          siteDescription: '精美的艺术作品展览',
          heroTitle: '艺术画集展览',
          heroSubtitle: '探索精美的艺术作品，感受创作的魅力',
          maxCollectionsPerPage: 9,
          enableSearch: true,
          enableCategories: true,
          defaultCategory: 'all',
          theme: 'light',
          language: 'zh',
        });
        
        console.log('✅ 默认配置创建成功');
      }
    } else {
      console.log('✅ 活动配置已存在，跳过创建');
    }

    // 第四步：更新分类表，关联到第一期活动
    console.log('🏷️ 4. 更新分类表关联到第一期活动...');
    const categoriesWithoutEvent = await db.select()
      .from(comicUniverseCategories)
      .where(isNull(comicUniverseCategories.eventId));

    if (categoriesWithoutEvent.length > 0) {
      await db.update(comicUniverseCategories)
        .set({ eventId: firstEventId })
        .where(isNull(comicUniverseCategories.eventId));
      
      console.log(`✅ 已更新 ${categoriesWithoutEvent.length} 个分类记录`);
    } else {
      console.log('✅ 分类表已经关联到活动，跳过更新');
    }

    // 第五步：更新标签表，关联到第一期活动
    console.log('🏷️ 5. 更新标签表关联到第一期活动...');
    const tagsWithoutEvent = await db.select()
      .from(comicUniverseTags)
      .where(isNull(comicUniverseTags.eventId));

    if (tagsWithoutEvent.length > 0) {
      await db.update(comicUniverseTags)
        .set({ eventId: firstEventId })
        .where(isNull(comicUniverseTags.eventId));
      
      console.log(`✅ 已更新 ${tagsWithoutEvent.length} 个标签记录`);
    } else {
      console.log('✅ 标签表已经关联到活动，跳过更新');
    }

    // 第六步：更新画集表，关联到第一期活动
    console.log('📚 6. 更新画集表关联到第一期活动...');
    const collectionsWithoutEvent = await db.select()
      .from(comicUniverseCollections)
      .where(isNull(comicUniverseCollections.eventId));

    if (collectionsWithoutEvent.length > 0) {
      await db.update(comicUniverseCollections)
        .set({ eventId: firstEventId })
        .where(isNull(comicUniverseCollections.eventId));
      
      console.log(`✅ 已更新 ${collectionsWithoutEvent.length} 个画集记录`);
    } else {
      console.log('✅ 画集表已经关联到活动，跳过更新');
    }

    console.log('🎉 多期活动数据迁移完成！');
    console.log('📊 迁移摘要：');
    console.log(`   - 第一期活动ID: ${firstEventId}`);
    console.log(`   - 分类记录更新: ${categoriesWithoutEvent.length}`);
    console.log(`   - 标签记录更新: ${tagsWithoutEvent.length}`);
    console.log(`   - 画集记录更新: ${collectionsWithoutEvent.length}`);

  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    throw error;
  }
}

/**
 * 验证迁移结果
 */
async function validateMigration() {
  console.log('🔍 验证迁移结果...');
  
  try {
    // 检查第一期活动
    const events = await db.select().from(showmasterEvents);
    console.log(`✅ 活动表记录数: ${events.length}`);

    // 检查活动配置
    const configs = await db.select().from(showmasterEventConfigs);
    console.log(`✅ 活动配置记录数: ${configs.length}`);

    // 检查数据关联
    const categoriesWithEvent = await db.select()
      .from(comicUniverseCategories)
      .where(eq(comicUniverseCategories.eventId, 1));
    console.log(`✅ 已关联活动的分类数: ${categoriesWithEvent.length}`);

    const tagsWithEvent = await db.select()
      .from(comicUniverseTags)
      .where(eq(comicUniverseTags.eventId, 1));
    console.log(`✅ 已关联活动的标签数: ${tagsWithEvent.length}`);

    const collectionsWithEvent = await db.select()
      .from(comicUniverseCollections)
      .where(eq(comicUniverseCollections.eventId, 1));
    console.log(`✅ 已关联活动的画集数: ${collectionsWithEvent.length}`);

    console.log('✅ 验证完成');

  } catch (error) {
    console.error('❌ 验证失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await migrateToMultiEvents();
    await validateMigration();
    console.log('🎊 多期活动架构升级完成！');
    process.exit(0);
  } catch (error) {
    console.error('💥 升级失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { migrateToMultiEvents, validateMigration };
