/**
 * ShowMasterpiece模块 - 配置项API路由
 * 
 * 专用于showmasterpiece模块的配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { showmasterConfigService } from '@/modules/showmasterpiece/configService';

// 获取showmasterpiece模块配置项列表
async function getConfigItems(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type') as any;
    const isActive = searchParams.get('isActive') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50'); // 默认显示更多项
    const environment = searchParams.get('environment') || 'development';
    const keys = searchParams.get('keys'); // 新增：支持按键名筛选

    console.log(`🎨 [ShowMasterpiece Config] 获取 ${environment} 环境的配置项`);

    // 如果指定了keys，直接查询这些配置项
    if (keys) {
      const keyList = keys.split(',').map(k => k.trim());
      console.log(`🎨 [ShowMasterpiece Config] 按键名筛选: ${keyList.join(', ')}`);
      
      const items = await Promise.all(
        keyList.map(key => showmasterConfigService.getConfigItemByKey(key, environment))
      );
      
      // 过滤掉null结果
      const validItems = items.filter(item => item !== null);
      
      return NextResponse.json({
        success: true,
        items: validItems,
        total: validItems.length,
        page: 1,
        pageSize: validItems.length,
        totalPages: 1,
        environment,
        module: 'showmasterpiece'
      });
    }

    // 使用专用的showmasterpiece配置服务
    const params = {
      search: search || undefined,
      type: type || undefined,
      environment,
      isActive,
      page,
      pageSize
    };

    const result = await showmasterConfigService.getConfigItems(params);

    return NextResponse.json({
      success: true,
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      environment,
      module: 'showmasterpiece'
    });
  } catch (error) {
    console.error('❌ [ShowMasterpiece Config] 获取配置项失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '获取配置项失败',
        items: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// 创建showmasterpiece专用配置项
async function createConfigItem(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      key, 
      displayName, 
      description, 
      value, 
      defaultValue, 
      type, 
      isRequired, 
      isSensitive, 
      validation, 
      sortOrder 
    } = body;
    
    if (!key || !displayName || !type) {
      return NextResponse.json(
        { 
          success: false,
          error: '配置键、显示名称和类型不能为空' 
        },
        { status: 400 }
      );
    }

    // 为showmasterpiece配置项添加特殊前缀
    const prefixedKey = key.startsWith('SHOWMASTER_') ? key : `SHOWMASTER_${key}`;

    // 查找或创建showmasterpiece分类
    let categoryId: string | undefined;
    try {
      const categories = await showmasterConfigService.getAllCategories();
      const generalCategory = categories.find(cat => cat.name === 'general');
      
      if (generalCategory) {
        categoryId = generalCategory.id;
      } else {
        // 初始化默认分类
        await showmasterConfigService.initializeDefaultCategories();
        const updatedCategories = await showmasterConfigService.getAllCategories();
        const newGeneralCategory = updatedCategories.find(cat => cat.name === 'general');
        categoryId = newGeneralCategory?.id;
      }
    } catch (catError) {
      console.warn('⚠️ [ShowMasterpiece Config] 处理分类时出错，使用undefined:', catError);
    }

    const configItem = await showmasterConfigService.createConfigItem({
      categoryId,
      key: prefixedKey,
      displayName: `[ShowMaster] ${displayName}`,
      description: description ? `ShowMasterpiece模块: ${description}` : null,
      value: value || null,
      defaultValue: defaultValue || null,
      type,
      isRequired: isRequired || false,
      isSensitive: isSensitive || false,
      validation: validation ? JSON.stringify(validation) : null,
      sortOrder: sortOrder || 0,
      environment: 'development', // 默认为开发环境
      isActive: true
    });
    
    console.log('✅ [ShowMasterpiece Config] 配置项创建成功:', configItem.key);
    
    return NextResponse.json({
      success: true,
      data: configItem,
      message: '配置项创建成功'
    });
  } catch (error) {
    console.error('❌ [ShowMasterpiece Config] 创建配置项失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '创建配置项失败' 
      },
      { status: 500 }
    );
  }
}

// 主处理函数
export async function GET(request: NextRequest) {
  return getConfigItems(request);
}

export async function POST(request: NextRequest) {
  return createConfigItem(request);
}
