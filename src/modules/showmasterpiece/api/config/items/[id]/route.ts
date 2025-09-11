/**
 * ShowMasterpiece模块 - 单个配置项API路由
 * 
 * 专用于showmasterpiece模块的配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { showmasterConfigService } from '../../../../db/services/configService';

// 获取单个配置项
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('🎨 [ShowMasterpiece Config] 获取配置项:', id);
    
    const configItem = await showmasterConfigService.getConfigItemById(id);
    
    if (!configItem) {
      return NextResponse.json(
        { 
          success: false,
          error: '配置项不存在' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: configItem
    });
  } catch (error) {
    console.error('❌ [ShowMasterpiece Config] 获取配置项失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '获取配置项失败' 
      },
      { status: 500 }
    );
  }
}

// 更新配置项
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { value, environment } = body;
    
    console.log('🎨 [ShowMasterpiece Config] 更新配置项:', id, '环境:', environment);
    
    // 获取现有配置项
    const existingItem = await showmasterConfigService.getConfigItemById(id);
    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false,
          error: '配置项不存在' 
        },
        { status: 404 }
      );
    }
    
    // 类型验证
    if (existingItem.type === 'number' && value && isNaN(Number(value))) {
      return NextResponse.json(
        { 
          success: false,
          error: '请输入有效的数字' 
        },
        { status: 400 }
      );
    }
    
    if (existingItem.type === 'boolean' && value && !['true', 'false'].includes(value.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false,
          error: '布尔值只能是 true 或 false' 
        },
        { status: 400 }
      );
    }
    
    // 更新配置项
    const updatedItem = await showmasterConfigService.updateConfigItem(id, {
      value: value
    }, 'api-user');
    
    console.log('✅ [ShowMasterpiece Config] 配置项更新成功:', updatedItem.key);
    
    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: '配置项更新成功'
    });
  } catch (error) {
    console.error('❌ [ShowMasterpiece Config] 更新配置项失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '更新配置项失败' 
      },
      { status: 500 }
    );
  }
}

// 删除配置项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('🎨 [ShowMasterpiece Config] 删除配置项:', id);
    
    // 检查配置项是否存在
    const existingItem = await showmasterConfigService.getConfigItemById(id);
    if (!existingItem) {
      return NextResponse.json(
        { 
          success: false,
          error: '配置项不存在' 
        },
        { status: 404 }
      );
    }
    
    // 检查是否为必需配置项
    if (existingItem.isRequired) {
      return NextResponse.json(
        { 
          success: false,
          error: '不能删除必需的配置项' 
        },
        { status: 400 }
      );
    }
    
    await showmasterConfigService.deleteConfigItem(id, 'api-user');
    
    console.log('✅ [ShowMasterpiece Config] 配置项删除成功:', existingItem.key);
    
    return NextResponse.json({
      success: true,
      message: '配置项删除成功'
    });
  } catch (error) {
    console.error('❌ [ShowMasterpiece Config] 删除配置项失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '删除配置项失败' 
      },
      { status: 500 }
    );
  }
}
