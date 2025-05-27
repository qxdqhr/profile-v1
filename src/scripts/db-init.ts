import { db } from '../db';
import { initializeDbFromJson } from '../db/services/exam-service';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function initializeDb() {
  try {
    console.log('开始初始化数据库...');
    
    // 这里可以添加数据库初始化逻辑
    // 比如创建默认数据、运行迁移等
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

async function main() {
  try {
    // 运行数据库迁移
    await initializeDb();
    
    // 从JSON文件导入数据
    await initializeDbFromJson();
    
    console.log('数据库初始化和数据导入完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 