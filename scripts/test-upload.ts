 /**
 * 测试ShowMasterpiece上传功能
 */

import { UniversalFileService } from '../src/services/universalFile/UniversalFileService';
import { createFileServiceConfig } from '../src/services/universalFile/config';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

async function testUpload() {
  console.log('🧪 开始测试ShowMasterpiece上传功能...\n');

  try {
    // 初始化通用文件服务
    const config = createFileServiceConfig();
    const fileService = new UniversalFileService(config.getConfig());
    await fileService.initialize();
    
    console.log('✅ 通用文件服务初始化成功');

    // 创建一个测试图片文件（如果存在的话）
    const testImagePath = join(__dirname, '..', 'public', 'images', 'avatar.jpg');
    
    // 检查测试图片是否存在
    if (!existsSync(testImagePath)) {
      console.log('⚠️ 测试图片不存在，创建一个模拟文件...');
      
      // 创建一个简单的测试文件
      const testContent = Buffer.from('fake-image-data');
      const testFile = new File([testContent], 'test-image.jpg', {
        type: 'image/jpeg'
      });
      
      console.log('📤 测试上传模拟图片...');
      const result = await fileService.uploadFile({
        file: testFile,
        moduleId: 'showmasterpiece',
        businessId: 'test',
        needsProcessing: true
      });
      
      console.log('✅ 上传成功！');
      console.log(`  - 文件ID: ${result.id}`);
      console.log(`  - 存储路径: ${result.storagePath}`);
      console.log(`  - CDN URL: ${result.cdnUrl}`);
      
    } else {
      console.log('📤 测试上传真实图片...');
      
      // 读取真实图片文件
      const imageBuffer = readFileSync(testImagePath);
      const testFile = new File([imageBuffer], 'avatar.jpg', {
        type: 'image/jpeg'
      });
      
      const result = await fileService.uploadFile({
        file: testFile,
        moduleId: 'showmasterpiece',
        businessId: 'test',
        needsProcessing: true
      });
      
      console.log('✅ 上传成功！');
      console.log(`  - 文件ID: ${result.id}`);
      console.log(`  - 存储路径: ${result.storagePath}`);
      console.log(`  - CDN URL: ${result.cdnUrl}`);
    }
    
    console.log('\n🎉 ShowMasterpiece上传功能测试完成！');
    
  } catch (error) {
    console.error('❌ 上传测试失败:', error);
    
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行测试
testUpload().catch(console.error);