/**
 * ShowMasterpiece模块 - 作品上传功能测试
 * 
 * 测试从作品上传到获取的完整流程
 */

import { UniversalFileService } from '@/services/universalFile/UniversalFileService';
import { createFileServiceConfig } from '@/services/universalFile/config';

async function testArtworkUpload() {
  console.log('🎨 开始测试ShowMasterpiece作品上传功能...\n');

  try {
    // 初始化文件服务
    const config = createFileServiceConfig();
    const fileService = new UniversalFileService(config.getConfig());
    await fileService.initialize();

    console.log('✅ 文件服务初始化成功');

    // 创建一个模拟的图片文件
    const mockImageData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG文件头
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFF,
      0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2,
      0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const mockImageFile = new File([mockImageData], 'test-artwork.png', { 
      type: 'image/png' 
    });
    
    // 构建上传信息
    const uploadInfo = {
      file: mockImageFile,
      moduleId: 'showmasterpiece',
      businessId: 'test-collection',
      customPath: 'showmasterpiece/test-collection',
      metadata: {
        uploadedBy: 'test-artist',
        uploadedAt: new Date().toISOString(),
        originalFileName: mockImageFile.name,
        artworkTitle: '测试作品',
        collectionId: 'test-collection'
      },
      needsProcessing: false
    };

    console.log('📤 开始上传作品图片...');
    
    // 执行文件上传
    const uploadResult = await fileService.uploadFile(uploadInfo);
    
    console.log('✅ 作品图片上传成功:', {
      fileId: uploadResult.id,
      originalName: uploadResult.originalName,
      storagePath: uploadResult.storagePath,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType
    });

    // 测试获取作品图片URL
    console.log('\n🔗 测试获取作品图片URL...');
    const imageUrl = await fileService.getFileUrl(uploadResult.id, 'test-artist');
    console.log('✅ 作品图片URL获取成功:', imageUrl);

    // 测试获取作品元数据
    console.log('\n📋 测试获取作品元数据...');
    const metadata = await fileService['getFileMetadata'](uploadResult.id);
    if (metadata) {
      console.log('✅ 作品元数据获取成功:', {
        id: metadata.id,
        originalName: metadata.originalName,
        size: metadata.size,
        mimeType: metadata.mimeType,
        moduleId: metadata.moduleId,
        businessId: metadata.businessId
      });
    } else {
      console.log('❌ 作品元数据获取失败');
    }

    // 模拟作品数据库记录
    console.log('\n💾 模拟创建作品数据库记录...');
    const artworkRecord = {
      id: 'test-artwork-001',
      title: '测试作品',
      description: '这是一个测试作品',
      fileId: uploadResult.id,
      collectionId: 'test-collection',
      artistId: 'test-artist',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('✅ 作品记录创建成功:', {
      id: artworkRecord.id,
      title: artworkRecord.title,
      fileId: artworkRecord.fileId
    });

    // 测试通过作品ID获取图片
    console.log('\n🖼️ 测试通过作品ID获取图片...');
    const artworkImageUrl = await fileService.getFileUrl(artworkRecord.fileId, 'test-artist');
    console.log('✅ 通过作品ID获取图片成功:', artworkImageUrl);

    // 测试删除作品
    console.log('\n🗑️ 测试删除作品...');
    await fileService.deleteFile(artworkRecord.fileId, 'test-artist');
    console.log('✅ 作品删除成功');

    console.log('\n🎉 ShowMasterpiece作品上传功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testArtworkUpload()
    .then(() => {
      console.log('\n✅ ShowMasterpiece测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ ShowMasterpiece测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testArtworkUpload }; 