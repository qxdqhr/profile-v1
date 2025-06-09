/**
 * ShowMasterpiece 配置管理 API 路由
 * 
 * 这个文件定义了画集系统配置管理的API端点。
 * 提供配置的获取、更新和重置功能。
 * 
 * API端点：
 * - GET /api/masterpieces/config - 获取系统配置
 * - PUT /api/masterpieces/config - 更新系统配置（需要认证）
 * - DELETE /api/masterpieces/config - 重置系统配置（需要认证）
 * 
 * 权限控制：
 * - GET 请求：公开访问，任何用户都可以获取配置
 * - PUT/DELETE 请求：需要用户认证，只有登录用户才能修改配置
 * 
 * @fileoverview API路由 - 系统配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { masterpiecesConfigDbService } from '../../db/masterpiecesDbService';
import { validateApiAuth } from '@/modules/auth/server';

/**
 * GET /api/masterpieces/config - 获取系统配置
 * 
 * 获取当前的系统配置信息，包括网站设置、显示选项等。
 * 这个端点是公开的，不需要认证，因为前端需要配置信息来正确显示页面。
 * 
 * @returns {Response} JSON格式的配置对象
 * 
 * 响应格式：
 * ```json
 * {
 *   "id": 1,
 *   "siteName": "艺术画集",
 *   "siteDescription": "收藏精美艺术作品",
 *   "heroTitle": "探索艺术之美",
 *   "heroSubtitle": "欣赏来自世界各地的精美画作",
 *   "maxCollectionsPerPage": 12,
 *   "enableSearch": true,
 *   "enableCategories": true,
 *   "defaultCategory": "全部",
 *   "theme": "auto",
 *   "language": "zh"
 * }
 * ```
 * 
 * 错误响应：
 * - 500: 服务器内部错误
 */
export async function GET() {
  try {
    const config = await masterpiecesConfigDbService.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/masterpieces/config - 更新系统配置
 * 
 * 更新系统配置信息。这个操作需要用户认证，只有登录的用户才能修改配置。
 * 支持部分更新，只传递需要修改的字段即可。
 * 
 * @param request - Next.js请求对象，包含配置数据
 * @returns {Response} 更新后的配置对象
 * 
 * 请求体格式：
 * ```json
 * {
 *   "siteName": "新网站名称",
 *   "maxCollectionsPerPage": 8,
 *   "theme": "dark"
 * }
 * ```
 * 
 * 响应格式：
 * - 200: 返回更新后的完整配置对象
 * - 401: 用户未认证
 * - 500: 服务器内部错误
 */
export async function PUT(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const configData = await request.json();
    const updatedConfig = await masterpiecesConfigDbService.updateConfig(configData);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/masterpieces/config - 重置系统配置
 * 
 * 将系统配置重置为默认值。这是一个危险操作，需要用户认证。
 * 重置后所有自定义配置都会丢失，恢复到系统初始状态。
 * 
 * @param request - Next.js请求对象
 * @returns {Response} 操作结果
 * 
 * 响应格式：
 * ```json
 * {
 *   "success": true
 * }
 * ```
 * 
 * 错误响应：
 * - 401: 用户未认证
 * - 500: 服务器内部错误
 * 
 * @warning 这个操作会清除所有自定义配置，请谨慎使用
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    await masterpiecesConfigDbService.resetConfig();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('重置配置失败:', error);
    return NextResponse.json(
      { error: '重置配置失败' },
      { status: 500 }
    );
  }
} 