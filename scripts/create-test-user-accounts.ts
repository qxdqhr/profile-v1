import { db } from '@/db/index';
import { users } from '@/modules/auth/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * 创建测试环境用户账号脚本
 * 用于在测试环境中创建标准的管理员和用户账号
 */

// 测试账号配置
const TEST_ACCOUNTS = [
  {
    phone: '13800138000',
    password: 'admin123456',
    name: '系统管理员',
    role: 'admin' as const,
    description: '系统管理员账号，拥有所有权限'
  },
  {
    phone: '13900139000', 
    password: 'test123456',
    name: '测试用户',
    role: 'user' as const,
    description: '普通测试用户账号'
  },
  {
    phone: '13700137000',
    password: 'demo123456', 
    name: '演示用户',
    role: 'user' as const,
    description: '用于演示的用户账号'
  }
];

async function createTestUsers() {
  console.log('🚀 开始创建测试用户账号...');
  
  try {
    for (const account of TEST_ACCOUNTS) {
      console.log(`\n📝 处理账号: ${account.phone} (${account.name})`);
      
      // 检查用户是否已存在
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.phone, account.phone))
        .limit(1);
      
      if (existingUser.length > 0) {
        console.log(`⚠️  用户 ${account.phone} 已存在，更新密码和信息...`);
        
        // 使用统一的盐值轮数 (12)
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        await db.update(users)
          .set({
            password: hashedPassword,
            name: account.name,
            role: account.role,
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(users.phone, account.phone));
        
        console.log(`✅ 用户 ${account.phone} 更新成功`);
      } else {
        console.log(`🆕 创建新用户 ${account.phone}...`);
        
        // 使用统一的盐值轮数 (12)
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        await db.insert(users).values({
          phone: account.phone,
          password: hashedPassword,
          name: account.name,
          role: account.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ 用户 ${account.phone} 创建成功`);
      }
      
      // 验证密码哈希
      const verifyUser = await db.select()
        .from(users)
        .where(eq(users.phone, account.phone))
        .limit(1);
      
      if (verifyUser.length > 0) {
        const isValid = await bcrypt.compare(account.password, verifyUser[0].password);
        console.log(`🔐 密码验证: ${isValid ? '✅ 成功' : '❌ 失败'}`);
        
        if (!isValid) {
          console.error(`❌ 密码验证失败！原始密码: ${account.password}`);
        }
      }
    }
    
    console.log('\n🎉 所有测试账号创建/更新完成！');
    
    // 显示账号总结
    console.log('\n📋 测试账号总结:');
    console.log('=====================================');
    for (const account of TEST_ACCOUNTS) {
      console.log(`📱 手机号: ${account.phone}`);
      console.log(`🔑 密码: ${account.password}`);
      console.log(`👤 姓名: ${account.name}`);
      console.log(`🏷️  角色: ${account.role}`);
      console.log(`📝 说明: ${account.description}`);
      console.log('-------------------------------------');
    }
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
    throw error;
  }
}

async function main() {
  try {
    await createTestUsers();
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  } catch (error) {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

export { createTestUsers, TEST_ACCOUNTS }; 