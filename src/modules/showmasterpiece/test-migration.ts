/**
 * ShowMasterpiece模块 - OSS迁移测试脚本
 * 
 * 用于验证舍弃Base64图片存储后的功能是否正常工作
 */

import { collectionsDbService, artworksDbService } from './db/masterpiecesDbService';

async function testMigration() {
  console.log('🧪 开始测试ShowMasterpiece模块OSS迁移...\n');

  try {
    // 测试1：获取所有画集（不再返回Base64数据）
    console.log('📋 测试1：获取所有画集');
    const collections = await collectionsDbService.getAllCollections();
    console.log(`✅ 成功获取 ${collections.length} 个画集`);
    
    // 检查画集中的作品数据
    let totalArtworks = 0;
    let artworksWithFileId = 0;
    let artworksWithImage = 0;
    
    for (const collection of collections) {
      totalArtworks += collection.pages.length;
      
      for (const artwork of collection.pages) {
        if (artwork.fileId) {
          artworksWithFileId++;
        }
        if (artwork.image && artwork.image.trim() !== '') {
          artworksWithImage++;
        }
      }
    }
    
    console.log(`📊 数据统计:`);
    console.log(`  - 总作品数: ${totalArtworks}`);
    console.log(`  - 使用fileId的作品: ${artworksWithFileId}`);
    console.log(`  - 仍有Base64数据的作品: ${artworksWithImage}`);
    console.log(`  - 迁移进度: ${((artworksWithFileId / totalArtworks) * 100).toFixed(1)}%`);
    
    if (artworksWithImage > 0) {
      console.log(`⚠️  仍有 ${artworksWithImage} 个作品使用Base64存储，需要进一步迁移`);
    } else {
      console.log(`✅ 所有作品都已迁移到OSS存储`);
    }

    // 测试2：获取单个画集的作品
    if (collections.length > 0) {
      console.log('\n📋 测试2：获取单个画集的作品');
      const firstCollection = collections[0];
      const artworks = await artworksDbService.getArtworksByCollection(firstCollection.id);
      console.log(`✅ 成功获取画集 "${firstCollection.title}" 的 ${artworks.length} 个作品`);
      
      // 检查作品数据结构
      const sampleArtwork = artworks[0];
      if (sampleArtwork) {
        console.log(`📊 作品数据结构检查:`);
        console.log(`  - 有fileId: ${!!sampleArtwork.fileId}`);
        console.log(`  - 有image: ${!!sampleArtwork.image}`);
        console.log(`  - image字段为空: ${!sampleArtwork.image || sampleArtwork.image.trim() === ''}`);
        console.log(`  - 作品标题: ${sampleArtwork.title}`);
      }
    }

    // 测试3：性能测试
    console.log('\n📋 测试3：性能测试');
    const startTime = Date.now();
    await collectionsDbService.getAllCollections();
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`✅ 查询耗时: ${queryTime}ms`);
    if (queryTime < 1000) {
      console.log(`✅ 性能良好，查询时间 < 1秒`);
    } else if (queryTime < 3000) {
      console.log(`⚠️  性能一般，查询时间 1-3秒`);
    } else {
      console.log(`❌ 性能较差，查询时间 > 3秒`);
    }

    // 测试4：缓存测试
    console.log('\n📋 测试4：缓存测试');
    const cacheStartTime = Date.now();
    await collectionsDbService.getAllCollections(true); // 使用缓存
    const cacheEndTime = Date.now();
    const cacheQueryTime = cacheEndTime - cacheStartTime;
    
    console.log(`✅ 缓存查询耗时: ${cacheQueryTime}ms`);
    if (cacheQueryTime < queryTime * 0.5) {
      console.log(`✅ 缓存效果良好，查询速度提升明显`);
    } else {
      console.log(`⚠️  缓存效果一般，可能需要优化`);
    }

    console.log('\n🎉 所有测试完成！');
    
    // 生成测试报告
    const report = {
      timestamp: new Date().toISOString(),
      totalCollections: collections.length,
      totalArtworks,
      artworksWithFileId,
      artworksWithImage,
      migrationProgress: (artworksWithFileId / totalArtworks) * 100,
      queryPerformance: queryTime,
      cachePerformance: cacheQueryTime,
      status: artworksWithImage === 0 ? 'COMPLETED' : 'IN_PROGRESS'
    };
    
    console.log('\n📊 测试报告:');
    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testMigration()
    .then(() => {
      console.log('\n✅ 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testMigration }; 