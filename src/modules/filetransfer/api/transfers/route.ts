/**
 * 文件传输列表 API 路由 - 重构版本
 * 
 * 提供文件传输记录的获取、创建和删除功能
 * 集成缓存、性能监控等新特性
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/modules/auth/server';
import { fileTransferService } from '../../services/fileTransferService';

/**
 * GET /api/filetransfer/transfers
 * 
 * 获取文件传输列表
 * 支持分页和筛选，集成缓存优化
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
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

    // 参数验证
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }

    // 获取传输列表
    const transfers = await fileTransferService.getUserTransfers(
      user.id.toString(),
      {
        page,
        limit,
        status: status as any,
      }
    );

    // 获取性能统计（用于调试）
    const performanceStats = fileTransferService.getPerformanceStats();
    const cacheStats = fileTransferService.getCacheStats();

    const response = {
      success: true,
      data: transfers,
      pagination: {
        page,
        limit,
        total: transfers.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        cached: cacheStats.hitRate > 0,
        performance: {
          cacheHitRate: cacheStats.hitRate,
          totalRequests: performanceStats.apiResponseTimes.totalRequests
        }
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('获取传输列表失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '获取传输列表失败',
        meta: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/filetransfer/transfers
 * 
 * 创建新的文件传输记录
 * 支持文件验证和性能监控
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: '未授权的访问'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: '未提供文件' 
        },
        { status: 400 }
      );
    }

    // 文件大小限制检查
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: `文件大小不能超过 ${Math.round(maxFileSize / 1024 / 1024)}MB`
        },
        { status: 400 }
      );
    }

    // 创建传输记录
    const transfer = await fileTransferService.uploadFile(file, user.id.toString());

    const response = {
      success: true,
      data: transfer,
      meta: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        fileSize: file.size,
        fileName: file.name
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('创建传输记录失败:', error);
    
    const errorMessage = error instanceof Error ? error.message : '创建传输记录失败';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        meta: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/filetransfer/transfers/:id
 * 
 * 删除文件传输记录
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: '未授权的访问' 
      }, { status: 401 });
    }

    // 从URL路径中获取文件ID
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const fileId = pathParts[pathParts.length - 1];

    if (!fileId) {
      return NextResponse.json(
        { 
          success: false,
          error: '未提供文件ID' 
        },
        { status: 400 }
      );
    }

    // 删除传输记录
    await fileTransferService.deleteTransfer(fileId, user.id.toString());

    const response = {
      success: true,
      message: '文件删除成功',
      meta: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        fileId
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('删除传输记录失败:', error);
    
    const errorMessage = error instanceof Error ? error.message : '删除传输记录失败';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        meta: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      },
      { status: 500 }
    );
  }
} 