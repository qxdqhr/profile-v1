import { db } from '../src/db/index';
import { users } from '../src/db/schema/auth';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createProdUserData() {
  try {
    console.log('开始为生产环境创建用户数据...');

    // 检查是否已有用户数据
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('生产环境已有用户数据，跳过创建');
      console.log('现有用户:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.phone} (${user.name || '未设置姓名'})`);
      });
      return;
    }

    // 创建默认管理员用户
    console.log('创建默认管理员用户...');
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123456', saltRounds);
    
    const adminUser = await db.insert(users).values({
      phone: '13800138000',
      password: hashedPassword,
      name: '系统管理员',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('管理员用户创建成功:', {
      id: adminUser[0].id,
      phone: adminUser[0].phone,
      name: adminUser[0].name,
      role: adminUser[0].role
    });

    // 创建测试用户
    console.log('创建测试用户...');
    
    const testPassword = await bcrypt.hash('test123456', saltRounds);
    
    const testUser = await db.insert(users).values({
      phone: '13900139000',
      password: testPassword,
      name: '测试用户',
      email: 'test@example.com',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log('测试用户创建成功:', {
      id: testUser[0].id,
      phone: testUser[0].phone,
      name: testUser[0].name,
      role: testUser[0].role
    });

    console.log('\n✅ 生产环境用户数据创建完成！');
    console.log('📱 登录信息:');
    console.log('  管理员账户:');
    console.log('    手机号: 13800138000');
    console.log('    密码: admin123456');
    console.log('  测试账户:');
    console.log('    手机号: 13900139000');
    console.log('    密码: test123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ 创建生产环境用户数据失败：', error);
    process.exit(1);
  }
}

createProdUserData(); 