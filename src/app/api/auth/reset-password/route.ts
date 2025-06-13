import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/modules/auth/services/authDbService';
import { validatePhoneNumber, validatePassword } from '@/modules/auth/utils/authUtils';

/**
 * 处理重置密码请求
 */
export async function POST(request: NextRequest) {
  console.log('🔑 [API/reset-password] 收到重置密码请求');
  try {
    const { phone, newPassword, verificationCode } = await request.json();
    console.log('📝 [API/reset-password] 重置密码参数:', { 
      phone, 
      newPassword: '***',
      verificationCode 
    });
    
    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      console.log('❌ [API/reset-password] 手机号格式错误');
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号格式' },
        { status: 400 }
      );
    }
    
    // 验证密码格式
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      console.log('❌ [API/reset-password] 密码格式错误');
      return NextResponse.json(
        { success: false, message: passwordValidation.message || '密码格式错误' },
        { status: 400 }
      );
    }
    
    // 验证验证码
    const isValidCode = await authDbService.verifyCode(phone, verificationCode);
    if (!isValidCode) {
      console.log('❌ [API/reset-password] 验证码无效');
      return NextResponse.json(
        { success: false, message: '验证码无效或已过期' },
        { status: 400 }
      );
    }
    
    // 重置密码
    await authDbService.resetPassword(phone, newPassword);
    console.log('✅ [API/reset-password] 密码重置成功');
    
    return NextResponse.json({
      success: true,
      message: '密码重置成功',
    });
    
  } catch (error) {
    console.error('💥 [API/reset-password] 重置密码异常:', error);
    return NextResponse.json(
      { success: false, message: '重置密码失败，请稍后重试' },
      { status: 500 }
    );
  }
} 