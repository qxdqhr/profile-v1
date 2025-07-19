/**
 * 测试API路由中的文件服务调用
 */

import { UniversalFileService } from '@/services/universalFile/UniversalFileService';
import { createFileServiceConfig } from '@/services/universalFile/config';

async function testApiFileService() {
  console.log('🔍 开始测试API路由中的文件服务调用...\n');

  const fileId = '62969ed5-00f2-4cad-be21-6b65bf54d93e';

  try {
    console.log('🔍 [API] 尝试通过fileId获取图片:', fileId);
    
    // 通过通用文件服务获取图片
    const { UniversalFileService } = await import('@/services/universalFile/UniversalFileService');
    const { createFileServiceConfig } = await import('@/services/universalFile/config');
    
    const config = createFileServiceConfig();
    console.log('🔍 [API] 文件服务配置:', {
      defaultStorage: config.getConfig().defaultStorage,
      storageProviders: Object.keys(config.getConfig().storageProviders).filter(key => (config.getConfig().storageProviders as any)[key].enabled)
    });
    
    const fileService = new UniversalFileService(config.getConfig());
    await fileService.initialize();
    
    const imageUrl = await fileService.getFileUrl(fileId);
    console.log('🔍 [API] 获取到的图片URL:', imageUrl);
    
    if (imageUrl) {
      console.log('✅ [API] 文件服务返回URL成功');
      
      // 测试URL是否可访问
      try {
        const response = await fetch(imageUrl);
        console.log('✅ [API] URL访问成功:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        });
      } catch (error) {
        console.log('❌ [API] URL访问失败:', error);
      }
    } else {
      console.error('❌ [API] 文件服务返回的URL为空');
    }

  } catch (error) {
    console.error('❌ [API] 通过fileId获取图片失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testApiFileService()
    .then(() => {
      console.log('\n✅ 测试脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testApiFileService }; 