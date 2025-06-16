/**
 * 文件传输列表 API 路由
 * 
 * 提供文件传输记录的获取、创建和删除功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/modules/auth/server';
import { fileTransferDbService } from '../../db/fileTransferDbService';

/**
 * GET /api/filetransfer/transfers
 * 
 * 获取文件传输列表
 * 支持分页和筛选
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // 获取传输列表
    const transfers = await fileTransferDbService.getTransfers({
      userId: user.id.toString(),
      page,
      limit,
      status: status as any,
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('获取传输列表失败:', error);
    return NextResponse.json(
      { error: '获取传输列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/filetransfer/transfers
 * 
 * 创建新的文件传输记录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 创建传输记录
    const transfer = await fileTransferDbService.createTransfer({
      file,
      userId: user.id.toString(),
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('创建传输记录失败:', error);
    return NextResponse.json(
      { error: '创建传输记录失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/filetransfer/transfers/:id
 * 
 * 删除指定的文件传输记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { id } = params;

    // 删除传输记录
    await fileTransferDbService.deleteTransfer(id, user.id.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除传输记录失败:', error);
    return NextResponse.json(
      { error: '删除传输记录失败' },
      { status: 500 }
    );
  }
} 