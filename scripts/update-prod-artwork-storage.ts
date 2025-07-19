import { db } from '../src/db/index';
import { fileMetadata } from '../src/services/universalFile/db/schema';
import { eq } from 'drizzle-orm';

async function updateProductionArtworkStorage() {
  try {
    console.log('🔍 检查生产环境第6个作品的存储提供者...');
    
    // 检查第6个作品（ID: 36）的当前状态
    const [artwork] = await db
      .select()
      .from(fileMetadata)
      .where(eq(fileMetadata.id, '62969ed5-00f2-4cad-be21-6b65bf54d93e'))
      .limit(1);
    
    if (!artwork) {
      console.log('❌ 第6个作品的文件元数据不存在');
      return;
    }
    
    console.log('📋 当前状态:');
    console.log(`  - 文件ID: ${artwork.id}`);
    console.log(`  - 原始名称: ${artwork.originalName}`);
    console.log(`  - 存储路径: ${artwork.storagePath}`);
    console.log(`  - 存储提供者ID: ${artwork.storageProviderId}`);
    
    // 检查是否需要更新存储提供者
    if (artwork.storageProviderId === 2) {
      console.log('✅ 存储提供者已经是aliyun-oss，无需更新');
    } else {
      console.log('🔄 更新存储提供者为aliyun-oss...');
      
      await db
        .update(fileMetadata)
        .set({ 
          storageProviderId: 2, // aliyun-oss的ID
          updatedAt: new Date()
        })
        .where(eq(fileMetadata.id, '62969ed5-00f2-4cad-be21-6b65bf54d93e'));
      
      console.log('✅ 存储提供者更新成功');
    }
    
    // 验证更新结果
    const [updatedArtwork] = await db
      .select()
      .from(fileMetadata)
      .where(eq(fileMetadata.id, '62969ed5-00f2-4cad-be21-6b65bf54d93e'))
      .limit(1);
    
    console.log('📋 更新后状态:');
    console.log(`  - 存储提供者ID: ${updatedArtwork.storageProviderId}`);
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

updateProductionArtworkStorage(); 