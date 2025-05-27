import { authDbService } from '@/db/services/authDbService';
import 'dotenv/config';

async function createTestUser() {
  try {
    console.log('开始创建测试用户...');
    
    // 创建测试用户
    const testPhone = '15663733877';
    const existingUser = await authDbService.findUserByPhone(testPhone);
    
    if (existingUser) {
      console.log('测试用户已存在:', existingUser);
    } else {
      const newUser = await authDbService.createUser(testPhone, '测试用户');
      console.log('测试用户创建成功:', newUser);
    }
    
    console.log('测试用户设置完成！');
    console.log('手机号:', testPhone);
    console.log('您可以使用此手机号登录系统');
    
    process.exit(0);
  } catch (error) {
    console.error('创建测试用户失败:', error);
    process.exit(1);
  }
}

createTestUser(); 