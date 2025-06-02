import { authDbService } from '../src/modules/auth/server';
import 'dotenv/config';

async function createTestUser() {
  try {
    console.log('开始创建测试用户...');
    
    // 创建测试用户
    const testUser = await authDbService.createUser(
      '13800138000', // 测试手机号
      'password123', // 测试密码
      '测试用户'     // 用户名
    );
    
    console.log('测试用户创建成功：', {
      id: testUser.id,
      phone: testUser.phone,
      name: testUser.name,
      role: testUser.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('创建测试用户失败：', error);
    process.exit(1);
  }
}

createTestUser(); 