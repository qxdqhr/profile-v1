import { NextRequest } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { User } from '@/types/auth';

/**
 * API权限验证工具函数
 * 从请求中提取会话token并验证用户身份
 */
export async function validateApiAuth(request: NextRequest): Promise<User | null> {
  console.log('🔐 [authUtils] 开始API权限验证');
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    console.log('🎫 [authUtils] 提取的session_token:', sessionToken ? sessionToken.substring(0, 8) + '...' : 'null');
    
    if (!sessionToken) {
      console.log('❌ [authUtils] 未找到会话令牌');
      return null;
    }
    
    const validation = await authDbService.validateSession(sessionToken);
    console.log('📄 [authUtils] 会话验证结果:', { 
      valid: validation.valid, 
      user: validation.user ? { id: validation.user.id, phone: validation.user.phone } : null 
    });
    
    const result = validation.valid && validation.user ? validation.user : null;
    console.log('✅ [authUtils] 权限验证完成:', result ? '通过' : '失败');
    return result;
  } catch (error) {
    console.error('💥 [authUtils] API权限验证异常:', error);
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