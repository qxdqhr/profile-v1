import { NextRequest } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { User } from '@/types/auth';

/**
 * API权限验证工具函数
 * 从请求中提取会话token并验证用户身份
 */
export async function validateApiAuth(request: NextRequest): Promise<User | null> {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const validation = await authDbService.validateSession(sessionToken);
    return validation.valid && validation.user ? validation.user : null;
  } catch (error) {
    console.error('API权限验证失败:', error);
    return null;
  }
}

/**
 * 检查用户是否具有管理员权限
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * 创建未授权响应
 */
export function createUnauthorizedResponse() {
  return {
    error: '未授权访问',
    status: 401
  };
} 