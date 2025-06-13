import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/modules/auth/services/authDbService';
import { validatePhoneNumber } from '@/modules/auth/utils/authUtils';

/**
 * 处理发送验证码请求
 */
export async function POST(request: NextRequest) {
  console.log('📱 [API/send-verification-code] 收到发送验证码请求');
  try {
    const { phone } = await request.json();
    console.log('📝 [API/send-verification-code] 手机号:', phone);
    
    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      console.log('❌ [API/send-verification-code] 手机号格式错误');
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号格式' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const user = await authDbService.getUserByPhone(phone);
    if (!user) {
      console.log('❌ [API/send-verification-code] 用户不存在');
      return NextResponse.json(
        { success: false, message: '该手机号未注册' },
        { status: 404 }
      );
    }
    
    // 生成并发送验证码
    const verificationCode = await authDbService.sendVerificationCode(phone);
    console.log('✅ [API/send-verification-code] 验证码发送成功');
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送',
    });
    
  } catch (error) {
    console.error('💥 [API/send-verification-code] 发送验证码异常:', error);
    return NextResponse.json(
      { success: false, message: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
} 