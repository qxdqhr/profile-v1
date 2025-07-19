import { configDbService } from '../db/configDbService';

/**
 * 初始化配置管理模块
 * 创建默认的配置分类和配置项
 */
async function initializeConfigManager() {
  try {
    console.log('🚀 开始初始化配置管理模块...');

    // 1. 创建OSS配置分类
    console.log('📦 创建OSS配置分类...');
    const ossCategory = await configDbService.createCategory({
      name: 'oss',
      displayName: '阿里云OSS配置',
      description: '阿里云对象存储服务配置',
      icon: 'fas fa-cloud',
      sortOrder: 1,
      isActive: true
    });

    // 2. 创建CDN配置分类
    console.log('🌐 创建CDN配置分类...');
    const cdnCategory = await configDbService.createCategory({
      name: 'cdn',
      displayName: '阿里云CDN配置',
      description: '阿里云内容分发网络配置',
      icon: 'fas fa-globe',
      sortOrder: 2,
      isActive: true
    });

    // 3. 创建七牛云配置分类
    console.log('☁️ 创建七牛云配置分类...');
    const qiniuCategory = await configDbService.createCategory({
      name: 'qiniu',
      displayName: '七牛云配置',
      description: '七牛云对象存储配置',
      icon: 'fas fa-cloud-upload-alt',
      sortOrder: 3,
      isActive: true
    });

    // 4. 创建数据库配置分类（仅用于数据库相关配置，不包含连接字符串）
    console.log('🗄️ 创建数据库配置分类...');
    const dbCategory = await configDbService.createCategory({
      name: 'database',
      displayName: '数据库配置',
      description: '数据库相关配置（连接字符串除外）',
      icon: 'fas fa-database',
      sortOrder: 4,
      isActive: true
    });

    // 5. 创建应用配置分类
    console.log('⚙️ 创建应用配置分类...');
    const appCategory = await configDbService.createCategory({
      name: 'application',
      displayName: '应用配置',
      description: '应用程序基础配置',
      icon: 'fas fa-cog',
      sortOrder: 5,
      isActive: true
    });

    // 6. 创建OSS配置项
    console.log('📝 创建OSS配置项...');
    const ossConfigItems = [
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_REGION',
        displayName: 'OSS区域',
        description: '阿里云OSS存储区域',
        value: 'oss-cn-beijing',
        defaultValue: 'oss-cn-beijing',
        type: 'string' as const,
        isRequired: true,
        isSensitive: false,
        sortOrder: 1
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_BUCKET',
        displayName: 'OSS存储桶',
        description: '阿里云OSS存储桶名称',
        value: 'profile-qhr-resource',
        defaultValue: 'profile-qhr-resource',
        type: 'string' as const,
        isRequired: true,
        isSensitive: false,
        sortOrder: 2
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_ACCESS_KEY_ID',
        displayName: 'AccessKey ID',
        description: '阿里云AccessKey ID',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: true,
        isSensitive: true,
        sortOrder: 3
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_ACCESS_KEY_SECRET',
        displayName: 'AccessKey Secret',
        description: '阿里云AccessKey Secret',
        value: '',
        defaultValue: '',
        type: 'password' as const,
        isRequired: true,
        isSensitive: true,
        sortOrder: 4
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_CUSTOM_DOMAIN',
        displayName: '自定义域名',
        description: 'OSS自定义域名（可选）',
        value: 'profile-qhr-resource.oss-cn-beijing.aliyuncs.com',
        defaultValue: 'profile-qhr-resource.oss-cn-beijing.aliyuncs.com',
        type: 'string' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 5
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_SECURE',
        displayName: '使用HTTPS',
        description: '是否使用HTTPS连接',
        value: 'true',
        defaultValue: 'true',
        type: 'boolean' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 6
      },
      {
        categoryId: ossCategory.id,
        key: 'ALIYUN_OSS_INTERNAL',
        displayName: '内网访问',
        description: '是否使用内网访问',
        value: 'false',
        defaultValue: 'false',
        type: 'boolean' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 7
      }
    ];

    for (const item of ossConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    // 7. 创建CDN配置项
    console.log('📝 创建CDN配置项...');
    const cdnConfigItems = [
      {
        categoryId: cdnCategory.id,
        key: 'ALIYUN_CDN_DOMAIN',
        displayName: 'CDN域名',
        description: '阿里云CDN加速域名',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 1
      },
      {
        categoryId: cdnCategory.id,
        key: 'ALIYUN_CDN_ACCESS_KEY_ID',
        displayName: 'CDN AccessKey ID',
        description: '阿里云CDN AccessKey ID',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: false,
        isSensitive: true,
        sortOrder: 2
      },
      {
        categoryId: cdnCategory.id,
        key: 'ALIYUN_CDN_ACCESS_KEY_SECRET',
        displayName: 'CDN AccessKey Secret',
        description: '阿里云CDN AccessKey Secret',
        value: '',
        defaultValue: '',
        type: 'password' as const,
        isRequired: false,
        isSensitive: true,
        sortOrder: 3
      }
    ];

    for (const item of cdnConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    // 8. 创建七牛云配置项
    console.log('📝 创建七牛云配置项...');
    const qiniuConfigItems = [
      {
        categoryId: qiniuCategory.id,
        key: 'QINIU_ACCESS_KEY',
        displayName: '七牛云AccessKey',
        description: '七牛云AccessKey',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: false,
        isSensitive: true,
        sortOrder: 1
      },
      {
        categoryId: qiniuCategory.id,
        key: 'QINIU_SECRET_KEY',
        displayName: '七牛云SecretKey',
        description: '七牛云SecretKey',
        value: '',
        defaultValue: '',
        type: 'password' as const,
        isRequired: false,
        isSensitive: true,
        sortOrder: 2
      },
      {
        categoryId: qiniuCategory.id,
        key: 'QINIU_BUCKET_NAME',
        displayName: '七牛云存储空间',
        description: '七牛云存储空间名称',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 3
      },
      {
        categoryId: qiniuCategory.id,
        key: 'QINIU_DOMAIN',
        displayName: '七牛云外链域名',
        description: '七牛云外链默认域名',
        value: '',
        defaultValue: '',
        type: 'string' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 4
      }
    ];

    for (const item of qiniuConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    // 9. 创建数据库配置项（不包含连接字符串）
    console.log('📝 创建数据库配置项...');
    const dbConfigItems = [
      {
        categoryId: dbCategory.id,
        key: 'DATABASE_POOL_SIZE',
        displayName: '数据库连接池大小',
        description: '数据库连接池的最大连接数',
        value: '10',
        defaultValue: '10',
        type: 'number' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 1
      },
      {
        categoryId: dbCategory.id,
        key: 'DATABASE_TIMEOUT',
        displayName: '数据库连接超时',
        description: '数据库连接超时时间（毫秒）',
        value: '5000',
        defaultValue: '5000',
        type: 'number' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 2
      },
      {
        categoryId: dbCategory.id,
        key: 'DATABASE_SSL_MODE',
        displayName: '数据库SSL模式',
        description: '数据库连接SSL模式（require, prefer, allow, disable）',
        value: 'prefer',
        defaultValue: 'prefer',
        type: 'string' as const,
        isRequired: false,
        isSensitive: false,
        sortOrder: 3
      }
    ];

    for (const item of dbConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    // 10. 创建应用配置项
    console.log('📝 创建应用配置项...');
    const appConfigItems = [
      {
        categoryId: appCategory.id,
        key: 'NODE_ENV',
        displayName: '运行环境',
        description: '应用程序运行环境',
        value: 'production',
        defaultValue: 'production',
        type: 'string' as const,
        isRequired: true,
        isSensitive: false,
        sortOrder: 1
      },
      {
        categoryId: appCategory.id,
        key: 'NEXTAUTH_SECRET',
        displayName: 'NextAuth密钥',
        description: 'NextAuth.js会话密钥',
        value: '',
        defaultValue: '',
        type: 'password' as const,
        isRequired: true,
        isSensitive: true,
        sortOrder: 2
      },
      {
        categoryId: appCategory.id,
        key: 'NEXTAUTH_URL',
        displayName: 'NextAuth URL',
        description: 'NextAuth.js回调URL',
        value: '',
        defaultValue: 'https://your-domain.com',
        type: 'string' as const,
        isRequired: true,
        isSensitive: false,
        sortOrder: 3
      }
    ];

    for (const item of appConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    console.log('✅ 配置管理模块初始化完成！');
    console.log('📊 创建了以下内容：');
    console.log(`  - 5个配置分类`);
    console.log(`  - ${ossConfigItems.length}个OSS配置项`);
    console.log(`  - ${cdnConfigItems.length}个CDN配置项`);
    console.log(`  - ${qiniuConfigItems.length}个七牛云配置项`);
    console.log(`  - ${dbConfigItems.length}个数据库配置项`);
    console.log(`  - ${appConfigItems.length}个应用配置项`);

  } catch (error) {
    console.error('❌ 配置管理模块初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeConfigManager()
    .then(() => {
      console.log('🎉 初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败:', error);
      process.exit(1);
    });
}

export { initializeConfigManager }; 