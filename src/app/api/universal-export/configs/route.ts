/**
 * 通用导出配置API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportConfigDB } from '@/services/universalExport/database';

/**
 * 获取模块的导出配置列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const businessId = searchParams.get('businessId');

    if (!moduleId) {
      return NextResponse.json(
        { error: '缺少必需的moduleId参数' },
        { status: 400 }
      );
    }

    const configs = await exportConfigDB.getConfigsByModule(moduleId, businessId || undefined);
    
    return NextResponse.json({ configs });
  } catch (error) {
    console.error('获取导出配置失败:', error);
    return NextResponse.json(
      { error: '获取导出配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建新的导出配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config = await exportConfigDB.createConfig({
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
      grouping: body.grouping || null,
      moduleId: body.moduleId,
      businessId: body.businessId,
      createdBy: body.createdBy || null,
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('创建导出配置失败:', error);
    return NextResponse.json(
      { error: '创建导出配置失败' },
      { status: 500 }
    );
  }
} 