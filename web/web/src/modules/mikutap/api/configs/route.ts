import { NextRequest, NextResponse } from 'next/server';
import { saveGridConfigToDB, loadGridConfigFromDB, getAllConfigsFromDB, deleteConfigFromDB } from '../../services/databaseService';
import { GridConfig } from '../../types';

// GET - 获取配置列表或单个配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (configId) {
      // 获取单个配置
      const config = await loadGridConfigFromDB(configId);
      if (!config) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }
      return NextResponse.json(config);
    } else {
      // 获取所有配置列表
      const configs = await getAllConfigsFromDB();
      return NextResponse.json(configs);
    }
  } catch (error) {
    console.error('Failed to get configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 创建新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: GridConfig = {
      ...body,
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(body.updatedAt),
    };

    await saveGridConfigToDB(config);
    return NextResponse.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}

// PUT - 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config: GridConfig = {
      ...body,
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(),
    };

    await saveGridConfigToDB(config);
    return NextResponse.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Failed to update configuration:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

// DELETE - 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    await deleteConfigFromDB(configId);
    return NextResponse.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Failed to delete configuration:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
} 