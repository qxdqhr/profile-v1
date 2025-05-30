import { db } from './src/db/index.js';
import { users } from './src/db/schema/auth.js';

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    const result = await db.select().from(users).limit(1);
    console.log('✅ 数据库连接成功！');
    console.log('用户数据:', result);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
  process.exit(0);
}

testConnection(); 