/**
 * ShowMasterpiece模块 - 文件上传流程测试脚本
 * 
 * 用于验证从上传到获取的完整流程是否正常工作
 */

import { UniversalFileService } from '@/services/universalFile/UniversalFileService';
import { createFileServiceConfig } from '@/services/universalFile/config';

async function testUploadFlow() {
  console.log('🧪 开始测试文件上传流程...\n');

  try {
    // 初始化文件服务
    const config = createFileServiceConfig();
    const fileService = new UniversalFileService(config.getConfig());
    await fileService.initialize();

    console.log('✅ 文件服务初始化成功');

    // 创建一个模拟的文件对象
    const mockFile = new File(['Hello World!'], 'test.txt', { type: 'text/plain' });
    
    // 构建上传信息
    const uploadInfo = {
      file: mockFile,
      moduleId: 'showmasterpiece',
      businessId: 'test',
      customPath: 'showmasterpiece/test',
      metadata: {
        uploadedBy: 'test-user',
        uploadedAt: new Date().toISOString(),
        originalFileName: mockFile.name
      },
      needsProcessing: false
    };

    console.log('📤 开始上传文件...');
    
    // 执行文件上传
    const uploadResult = await fileService.uploadFile(uploadInfo);
    
    console.log('✅ 文件上传成功:', {
      fileId: uploadResult.id,
      originalName: uploadResult.originalName,
      storagePath: uploadResult.storagePath,
      size: uploadResult.size
    });

    // 测试获取文件URL
    console.log('\n🔗 测试获取文件URL...');
    const fileUrl = await fileService.getFileUrl(uploadResult.id, 'test-user');
    console.log('✅ 文件URL获取成功:', fileUrl);

    // 测试获取文件元数据
    console.log('\n📋 测试获取文件元数据...');
    const metadata = await fileService['getFileMetadata'](uploadResult.id);
    if (metadata) {
      console.log('✅ 文件元数据获取成功:', {
        id: metadata.id,
        originalName: metadata.originalName,
        size: metadata.size,
        mimeType: metadata.mimeType
      });
    } else {
      console.log('❌ 文件元数据获取失败');
    }

    // 测试删除文件
    console.log('\n🗑️ 测试删除文件...');
    await fileService.deleteFile(uploadResult.id, 'test-user');
    console.log('✅ 文件删除成功');

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testUploadFlow()
    .then(() => {
      console.log('\n✅ 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testUploadFlow }; 