import { authDbService } from '@/modules/auth/server';
import 'dotenv/config';

async function createTestUser() {
  try {
    console.log('开始创建测试用户...');
    
    // 创建测试用户
    const testPhone = '15663733877';
    const testPassword = 'test123456';
    
    try {
      const newUser = await authDbService.createUser(testPhone, testPassword, '测试用户');
      console.log('测试用户创建成功:', {
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
        role: newUser.role
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('用户已存在')) {
        console.log('测试用户已存在，手机号:', testPhone);
      } else {
        throw error;
      }
    }
    
    console.log('测试用户设置完成！');
    console.log('手机号:', testPhone);
    console.log('密码:', testPassword);
    console.log('您可以使用此手机号和密码登录系统');
    
    process.exit(0);
  } catch (error) {
    console.error('创建测试用户失败:', error);
    process.exit(1);
  }
}

createTestUser(); 