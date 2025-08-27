/**
 * 查询所有用户的登录信息脚本
 * 
 * 这个脚本会查询数据库中所有用户的信息（不包含密码哈希），
 * 用于更新测试账户文档。
 * 
 * 运行方式：
 * - 测试环境: pnpm run devdb:queryusers
 * - 生产环境: pnpm run prodb:queryusers
 */

import { db } from '@/db/index';
import { users } from '@/modules/auth/db/schema';
import { desc } from 'drizzle-orm';

interface UserInfo {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

async function queryAllUsers() {
  console.log('🔍 开始查询所有用户信息...');
  
  try {
    // 查询所有用户信息（不包含密码）
    const allUsers = await db
      .select({
        id: users.id,
        phone: users.phone,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)); // 按创建时间降序排列，最新用户在前

    console.log(`✅ 查询完成，共找到 ${allUsers.length} 个用户\n`);

    if (allUsers.length === 0) {
      console.log('❌ 数据库中没有用户数据');
      return;
    }

    // 输出用户信息
    console.log('📋 用户列表：');
    console.log('='.repeat(80));
    
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. 用户信息：`);
      console.log(`   📱 手机号: ${user.phone}`);
      console.log(`   👤 姓名: ${user.name || '未设置'}`);
      console.log(`   📧 邮箱: ${user.email || '未设置'}`);
      console.log(`   🔑 角色: ${user.role}`);
      console.log(`   ✅ 状态: ${user.isActive ? '活跃' : '禁用'}`);
      console.log(`   🕐 最后登录: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : '从未登录'}`);
      console.log(`   📅 创建时间: ${user.createdAt.toISOString()}`);
      console.log(`   🔄 更新时间: ${user.updatedAt.toISOString()}`);
    });

    console.log('\n' + '='.repeat(80));

    // 生成 Markdown 格式的用户信息
    console.log('\n📝 Markdown 格式输出：');
    console.log('='.repeat(50));
    
    // 按角色分组
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    const regularUsers = allUsers.filter(user => user.role === 'user');

    if (adminUsers.length > 0) {
      console.log('\n### 管理员账号');
      adminUsers.forEach((user, index) => {
        console.log(`\n#### 管理员 ${index + 1}`);
        console.log(`- **手机号**: \`${user.phone}\``);
        console.log(`- **姓名**: ${user.name || '未设置'}`);
        console.log(`- **角色**: \`${user.role}\``);
        console.log(`- **权限**: 拥有所有系统权限`);
        console.log(`- **最后登录**: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('zh-CN') : '从未登录'}`);
        console.log(`- **状态**: ${user.isActive ? '✅ 活跃' : '❌ 禁用'}`);
        console.log(`- **创建时间**: ${user.createdAt.toLocaleDateString('zh-CN')}`);
      });
    }

    if (regularUsers.length > 0) {
      console.log('\n### 普通用户账号');
      regularUsers.forEach((user, index) => {
        console.log(`\n#### 用户 ${index + 1}`);
        console.log(`- **手机号**: \`${user.phone}\``);
        console.log(`- **姓名**: ${user.name || '未设置'}`);
        console.log(`- **角色**: \`${user.role}\``);
        console.log(`- **权限**: 普通用户权限`);
        console.log(`- **最后登录**: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('zh-CN') : '从未登录'}`);
        console.log(`- **状态**: ${user.isActive ? '✅ 活跃' : '❌ 禁用'}`);
        console.log(`- **创建时间**: ${user.createdAt.toLocaleDateString('zh-CN')}`);
      });
    }

    // 统计信息
    console.log('\n### 📊 统计信息');
    console.log(`- **总用户数**: ${allUsers.length}`);
    console.log(`- **管理员数量**: ${adminUsers.length}`);
    console.log(`- **普通用户数量**: ${regularUsers.length}`);
    console.log(`- **活跃用户**: ${allUsers.filter(u => u.isActive).length}`);
    console.log(`- **禁用用户**: ${allUsers.filter(u => !u.isActive).length}`);
    console.log(`- **有登录记录**: ${allUsers.filter(u => u.lastLoginAt).length}`);

    console.log('\n🔒 注意：出于安全考虑，密码信息未显示。所有密码都使用 bcrypt 进行哈希存储。');
    console.log('如需测试登录，请参考 docs/test-accounts.md 文档中的测试账号信息。');

  } catch (error) {
    console.error('❌ 查询用户信息失败:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('🚀 用户信息查询工具');
  console.log('📌 当前环境:', process.env.NODE_ENV || 'development');
  
  if (process.env.DATABASE_URL) {
    console.log('🔗 数据库连接:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));
  }
  
  console.log('');
  
  await queryAllUsers();
  
  console.log('\n✅ 查询完成！');
  process.exit(0);
}

// 运行脚本
main().catch((error) => {
  console.error('💥 脚本执行失败:', error);
  process.exit(1);
});
