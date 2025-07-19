/**
 * 配置项管理API
 * 
 * 处理单个配置项的更新操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { configItems } from '../../../../../modules/configManager/db/schema';

// 获取数据库连接
function getDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }

  const client = postgres(DATABASE_URL, {
    ssl: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });

  return drizzle(client);
}

// PUT /api/configManager/items/[id] - 更新配置项
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment') || 'development';
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必需的 value 字段' },
        { status: 400 }
      );
    }

    console.log(`更新 ${environment} 环境的配置项 ${id}`);

    const db = getDatabase();

    // 检查配置项是否存在
    const existingItem = await db
      .select()
      .from(configItems)
      .where(eq(configItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置项不存在' },
        { status: 404 }
      );
    }

    // 更新配置项
    await db
      .update(configItems)
      .set({
        value: value.toString(),
        updatedAt: new Date()
      })
      .where(eq(configItems.id, id));

    // 获取更新后的配置项
    const updatedItem = await db
      .select()
      .from(configItems)
      .where(eq(configItems.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: updatedItem[0],
      message: `配置项更新成功 (${environment}环境)`,
      environment
    });

  } catch (error: any) {
    console.error('更新配置项失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，请检查数据库服务是否正常运行',
          details: 'SSL/TLS连接问题，请检查数据库配置'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '更新配置项失败', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/configManager/items/[id] - 删除配置项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment') || 'development';

    console.log(`删除 ${environment} 环境的配置项 ${id}`);

    const db = getDatabase();

    // 检查配置项是否存在
    const existingItem = await db
      .select()
      .from(configItems)
      .where(eq(configItems.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置项不存在' },
        { status: 404 }
      );
    }

    // 检查是否为必需配置项
    if (existingItem[0].isRequired) {
      return NextResponse.json(
        { success: false, error: '不能删除必需配置项' },
        { status: 400 }
      );
    }

    // 删除配置项
    await db
      .delete(configItems)
      .where(eq(configItems.id, id));

    return NextResponse.json({
      success: true,
      message: `配置项删除成功 (${environment}环境)`,
      environment
    });

  } catch (error: any) {
    console.error('删除配置项失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，请检查数据库服务是否正常运行',
          details: 'SSL/TLS连接问题，请检查数据库配置'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '删除配置项失败', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/configManager/items/[id] - 获取单个配置项
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDatabase();

    const item = await db
      .select()
      .from(configItems)
      .where(eq(configItems.id, id))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { success: false, error: '配置项不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item[0]
    });

  } catch (error: any) {
    console.error('获取配置项失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，请检查数据库服务是否正常运行',
          details: 'SSL/TLS连接问题，请检查数据库配置'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '获取配置项失败', details: error.message },
      { status: 500 }
    );
  }
} 