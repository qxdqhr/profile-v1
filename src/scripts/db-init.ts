import { initializeDb } from '../db';
import { initializeDbFromJson } from '../db/services/exam-service';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

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