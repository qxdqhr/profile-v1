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

    // 2. 创建数据库配置分类
    console.log('🗄️ 创建数据库配置分类...');
    const dbCategory = await configDbService.createCategory({
      name: 'database',
      displayName: '数据库配置',
      description: '数据库连接配置',
      icon: 'fas fa-database',
      sortOrder: 2,
      isActive: true
    });

    // 3. 创建应用配置分类
    console.log('⚙️ 创建应用配置分类...');
    const appCategory = await configDbService.createCategory({
      name: 'application',
      displayName: '应用配置',
      description: '应用程序基础配置',
      icon: 'fas fa-cog',
      sortOrder: 3,
      isActive: true
    });

    // 4. 创建OSS配置项
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
        value: 'oss-cn-beijing.aliyuncs.com',
        defaultValue: 'oss-cn-beijing.aliyuncs.com',
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

    // 5. 创建数据库配置项
    console.log('📝 创建数据库配置项...');
    const dbConfigItems = [
      {
        categoryId: dbCategory.id,
        key: 'DATABASE_URL',
        displayName: '数据库连接URL',
        description: 'PostgreSQL数据库连接字符串',
        value: '',
        defaultValue: 'postgresql://username:password@localhost:5432/database_name',
        type: 'string' as const,
        isRequired: true,
        isSensitive: true,
        sortOrder: 1
      }
    ];

    for (const item of dbConfigItems) {
      await configDbService.createConfigItem({
        ...item,
        isActive: true,
        validation: null
      });
    }

    // 6. 创建应用配置项
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
    console.log(`  - 3个配置分类`);
    console.log(`  - ${ossConfigItems.length}个OSS配置项`);
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