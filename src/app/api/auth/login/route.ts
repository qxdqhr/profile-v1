import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, password }: LoginRequest = await request.json();
    
    // 验证输入
    if (!phone || !password) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '请输入手机号和密码' },
        { status: 400 }
      );
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '请输入正确的手机号格式' },
        { status: 400 }
      );
    }
    
    // 验证用户密码
    const user = await authDbService.verifyPassword(phone, password);
    
    if (!user) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    // 创建会话
    const session = await authDbService.createSession(user.id);
    
    // 更新最后登录时间
    await authDbService.updateLastLogin(user.id);
    
    // 设置会话cookie
    const response = NextResponse.json<LoginResponse>({
      success: true,
      user,
      sessionToken: session.sessionToken,
      message: '登录成功',
    });
    
    // 设置HttpOnly cookie
    response.cookies.set('session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json<LoginResponse>(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 