import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '../../services/authDbService';
import { validatePhoneNumber, validatePassword } from '../../utils/authUtils';

export async function POST(request: NextRequest) {
  console.log('📝 [API/register] 收到注册请求');
  
  try {
    const body = await request.json();
    console.log('📋 [API/register] 注册参数:', { 
      phone: body.phone, 
      name: body.name,
      password: body.password
    });

    const { phone, password, name } = body;

    // 验证必填字段
    if (!phone || !password) {
      console.log('❌ [API/register] 手机号或密码为空');
      return NextResponse.json({
        success: false,
        message: '手机号和密码不能为空'
      }, { status: 400 });
    }

    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      console.log('❌ [API/register] 手机号格式错误:', phone);
      return NextResponse.json({
        success: false,
        message: '手机号格式错误'
      }, { status: 400 });
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.log('❌ [API/register] 密码格式错误:', passwordValidation.message);
      return NextResponse.json({
        success: false,
        message: passwordValidation.message
      }, { status: 400 });
    }

    // 创建用户
    try {
      console.log('👤 [API/register] 开始创建用户...');
      const user = await authDbService.createUser(phone, password, name);
      console.log('✅ [API/register] 用户创建成功:', { id: user.id, phone: user.phone });

      // 创建会话
      console.log('🎫 [API/register] 创建会话...');
      const session = await authDbService.createSession(user.id);

      // 更新最后登录时间
      await authDbService.updateLastLogin(user.id);

      console.log('🍪 [API/register] 设置Cookie...');
      const response = NextResponse.json({
        success: true,
        message: '注册成功',
        user
      });

      // 设置会话Cookie
      response.cookies.set('session_token', session.sessionToken, {
        httpOnly: true,
        secure: false, //process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30天
        path: '/'
      });

      console.log('🎉 [API/register] 注册流程完成');
      return response;

    } catch (error: any) {
      console.error('💥 [API/register] 创建用户失败:', error);
      
      if (error.message === '用户已存在') {
        return NextResponse.json({
          success: false,
          message: '该手机号已注册，请直接登录'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        message: '注册失败，请稍后重试'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [API/register] 请求处理异常:', error);
    return NextResponse.json({
      success: false,
      message: '服务器错误，请稍后重试'
    }, { status: 500 });
  }
} 