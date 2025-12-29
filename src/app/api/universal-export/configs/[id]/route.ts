/**
 * 单个导出配置操作API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportConfigDB } from '@/services/universalExport/database';

/**
 * 获取单个导出配置
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = await exportConfigDB.getConfigById(id);
    
    if (!config) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('获取导出配置失败:', error);
    return NextResponse.json(
      { error: '获取导出配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新导出配置
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const config = await exportConfigDB.updateConfig(id, {
      name: body.name,
      description: body.description || null,
      format: body.format,
      fields: body.fields,
      fileNameTemplate: body.fileNameTemplate,
      includeHeader: body.includeHeader,
      delimiter: body.delimiter,
      encoding: body.encoding,
      addBOM: body.addBOM,
      maxRows: body.maxRows,
      grouping: body.grouping,
    });

    if (!config) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('更新导出配置失败:', error);
    return NextResponse.json(
      { error: '更新导出配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除导出配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await exportConfigDB.deleteConfig(id);
    
    if (!success) {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '配置已删除' });
  } catch (error) {
    console.error('删除导出配置失败:', error);
    return NextResponse.json(
      { error: '删除导出配置失败' },
      { status: 500 }
    );
  }
}
