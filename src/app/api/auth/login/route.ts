import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  console.log('🔑 [API/login] 收到登录请求');
  try {
    const { phone, password }: LoginRequest = await request.json();
    console.log('📝 [API/login] 登录参数:', { phone, password: '***' });
    
    // 验证输入
    if (!phone || !password) {
      console.log('❌ [API/login] 参数缺失');
      return NextResponse.json<LoginResponse>(
        { success: false, message: '请输入手机号和密码' },
        { status: 400 }
      );
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      console.log('❌ [API/login] 手机号格式错误');
      return NextResponse.json<LoginResponse>(
        { success: false, message: '请输入正确的手机号格式' },
        { status: 400 }
      );
    }
    
    console.log('🔍 [API/login] 开始验证用户密码...');
    // 验证用户密码
    const user = await authDbService.verifyPassword(phone, password);
    
    if (!user) {
      console.log('❌ [API/login] 用户验证失败');
      return NextResponse.json<LoginResponse>(
        { success: false, message: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    console.log('✅ [API/login] 用户验证成功:', user);
    console.log('🎫 [API/login] 创建会话...');
    
    // 创建会话
    const session = await authDbService.createSession(user.id);
    console.log('✅ [API/login] 会话创建成功:', { 
      sessionToken: session.sessionToken.substring(0, 8) + '...', 
      expiresAt: session.expiresAt 
    });
    
    // 更新最后登录时间
    await authDbService.updateLastLogin(user.id);
    
    // 设置会话cookie
    const response = NextResponse.json<LoginResponse>({
      success: true,
      user,
      sessionToken: session.sessionToken,
      message: '登录成功',
    });
    
    // 获取请求的协议
    const requestUrl = new URL(request.url);
    const isHttps = requestUrl.protocol === 'https:';
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🔍 [API/login] URL分析:', {
      url: request.url,
      protocol: requestUrl.protocol,
      host: requestUrl.host,
      isHttps,
      isProduction
    });
    
    // 暂时禁用secure标志用于调试
    const cookieOptions = {
      httpOnly: true,
      secure: false, // 暂时禁用secure标志
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
    };
    
    console.log('🍪 [API/login] 设置cookie选项:', cookieOptions);
    console.log('🌐 [API/login] 当前环境:', process.env.NODE_ENV);
    console.log('🔒 [API/login] 请求协议:', isHttps ? 'HTTPS' : 'HTTP');
    console.log('🔒 [API/login] 请求URL:', request.url);
    
    // 设置HttpOnly cookie
    response.cookies.set('session_token', session.sessionToken, cookieOptions);
    
    console.log('✅ [API/login] 登录流程完成，返回响应');
    return response;
    
  } catch (error) {
    console.error('💥 [API/login] 登录异常:', error);
    return NextResponse.json<LoginResponse>(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 