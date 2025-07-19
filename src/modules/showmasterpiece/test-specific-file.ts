/**
 * 测试特定文件ID的访问
 */

import { UniversalFileService } from '@/services/universalFile/UniversalFileService';
import { createFileServiceConfig } from '@/services/universalFile/config';

async function testSpecificFile() {
  console.log('🔍 开始测试特定文件访问...\n');

  const fileId = '62969ed5-00f2-4cad-be21-6b65bf54d93e';

  try {
    // 初始化文件服务
    const config = createFileServiceConfig();
    const fileService = new UniversalFileService(config.getConfig());
    await fileService.initialize();

    console.log('✅ 文件服务初始化成功');

    // 测试获取文件元数据
    console.log('\n📋 测试获取文件元数据...');
    const metadata = await fileService['getFileMetadata'](fileId);
    if (metadata) {
      console.log('✅ 文件元数据获取成功:', {
        id: metadata.id,
        originalName: metadata.originalName,
        size: metadata.size,
        mimeType: metadata.mimeType,
        storagePath: metadata.storagePath
      });
    } else {
      console.log('❌ 文件元数据获取失败');
      return;
    }

    // 测试获取文件URL
    console.log('\n🔗 测试获取文件URL...');
    const fileUrl = await fileService.getFileUrl(fileId, 'test-user');
    console.log('✅ 文件URL获取成功:', fileUrl);

    // 测试访问URL
    console.log('\n🌐 测试访问URL...');
    try {
      const response = await fetch(fileUrl);
      console.log('✅ URL访问成功:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
    } catch (error) {
      console.log('❌ URL访问失败:', error);
    }

    console.log('\n🎉 特定文件测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSpecificFile()
    .then(() => {
      console.log('\n✅ 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testSpecificFile }; 