import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 获取试卷配置文件路径
const getConfigFilePath = (type: string = 'default') => {
  // 对type参数进行清洗，防止路径遍历攻击
  const safeType = type.replace(/[^\w-]/g, '');
  return path.join(process.cwd(), 'public', 'data', 'experiment', `${safeType}.json`);
};

// 确保目录存在
async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);
  try {
    await fs.access(directory);
  } catch (error) {
    // 目录不存在，创建它
    await fs.mkdir(directory, { recursive: true });
  }
}

// GET 请求 - 获取配置数据
export async function GET(request: NextRequest) {
  try {
    // 从查询字符串获取试卷类型
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';
    const configFilePath = getConfigFilePath(type);
    
    await ensureDirectoryExists(configFilePath);
    
    try {
      // 尝试读取文件
      const fileContent = await fs.readFile(configFilePath, 'utf-8');
      const configData = JSON.parse(fileContent);
      return NextResponse.json(configData);
    } catch (error) {
      // 文件不存在或读取错误，返回 404
      return NextResponse.json(
        { error: `试卷类型 ${type} 的配置文件不存在` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('获取配置文件失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST 请求 - 保存配置数据
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 从查询字符串获取试卷类型
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';
    const configFilePath = getConfigFilePath(type);
    
    await ensureDirectoryExists(configFilePath);
    
    // 写入文件
    await fs.writeFile(configFilePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true,
      message: `试卷类型 ${type} 的配置已保存`
    });
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    );
  }
} 