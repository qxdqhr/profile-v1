import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 试卷类型元数据文件路径
const EXAM_TYPES_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'experiment', 'exam_types.json');
const EXAM_METADATA_DIR = path.join(process.cwd(), 'public', 'data', 'experiment', 'metadata');

// 确保目录存在
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // 目录不存在，创建它
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 获取所有试卷类型
async function getAllExamTypes(): Promise<string[]> {
  try {
    await ensureDirectoryExists(path.dirname(EXAM_TYPES_FILE_PATH));
    
    try {
      const content = await fs.readFile(EXAM_TYPES_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // 如果文件不存在或解析错误，返回默认值并创建文件
      const defaultTypes = ['default', 'arknights'];
      await fs.writeFile(EXAM_TYPES_FILE_PATH, JSON.stringify(defaultTypes, null, 2), 'utf-8');
      return defaultTypes;
    }
  } catch (error) {
    console.error('获取试卷类型列表失败:', error);
    return ['default', 'arknights']; // 返回默认值
  }
}

// 保存试卷类型列表
async function saveExamTypes(types: string[]): Promise<void> {
  await ensureDirectoryExists(path.dirname(EXAM_TYPES_FILE_PATH));
  await fs.writeFile(EXAM_TYPES_FILE_PATH, JSON.stringify(types, null, 2), 'utf-8');
}

// 获取试卷类型元数据
async function getExamMetadata(id: string) {
  await ensureDirectoryExists(EXAM_METADATA_DIR);
  
  const metadataPath = path.join(EXAM_METADATA_DIR, `${id}.json`);
  
  try {
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // 文件不存在或读取错误，返回默认元数据
    if (id === 'default') {
      return {
        id: 'default',
        name: '通用考试',
        description: '系统默认试卷',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
    } else if (id === 'arknights') {
      return {
        id: 'arknights',
        name: '明日方舟测试',
        description: '明日方舟相关知识测试',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
    }
    
    return null;
  }
}

// 保存试卷类型元数据
async function saveExamMetadata(id: string, metadata: any): Promise<void> {
  await ensureDirectoryExists(EXAM_METADATA_DIR);
  
  const metadataPath = path.join(EXAM_METADATA_DIR, `${id}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

// 删除试卷类型元数据
async function deleteExamMetadata(id: string): Promise<void> {
  const metadataPath = path.join(EXAM_METADATA_DIR, `${id}.json`);
  
  try {
    await fs.unlink(metadataPath);
  } catch (error) {
    // 文件可能不存在，忽略错误
  }
}

// 检查配置文件中的题目数量
async function getQuestionCount(examId: string): Promise<number> {
  try {
    const configPath = path.join(process.cwd(), 'public', 'data', 'experiment', `${examId}.json`);
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    return config.questions?.length || 0;
  } catch (error) {
    return 0;
  }
}

// GET 请求 - 获取所有试卷类型
export async function GET(request: NextRequest) {
  try {
    const types = await getAllExamTypes();
    
    // 检查是否有详细信息的请求参数
    const { searchParams } = new URL(request.url);
    const withDetails = searchParams.get('details') === 'true';
    
    if (withDetails) {
      // 获取每个试卷类型的详细信息
      const detailsPromises = types.map(async (type) => {
        const metadata = await getExamMetadata(type) || {
          id: type,
          name: type,
          description: '',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        
        // 获取题目数量
        const questionCount = await getQuestionCount(type);
        
        return {
          ...metadata,
          questionCount,
        };
      });
      
      const details = await Promise.all(detailsPromises);
      return NextResponse.json(details);
    }
    
    return NextResponse.json(types);
  } catch (error) {
    console.error('获取试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST 请求 - 创建新试卷类型
export async function POST(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    
    // 验证请求数据
    if (!id || !name) {
      return NextResponse.json(
        { error: '试卷ID和名称是必需的' },
        { status: 400 }
      );
    }
    
    // 验证ID格式
    if (!/^[a-z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        { error: '试卷ID格式不正确，只能包含小写字母、数字、下划线和连字符' },
        { status: 400 }
      );
    }
    
    // 获取现有试卷类型
    const types = await getAllExamTypes();
    
    // 检查ID是否已存在
    if (types.includes(id)) {
      return NextResponse.json(
        { error: '此试卷ID已存在' },
        { status: 409 }
      );
    }
    
    // 添加新试卷类型
    const updatedTypes = [...types, id];
    await saveExamTypes(updatedTypes);
    
    // 创建元数据
    const metadata = {
      id,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    
    // 保存元数据
    await saveExamMetadata(id, metadata);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      id,
      message: `已创建试卷类型 ${name}`
    });
  } catch (error) {
    console.error('创建试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// DELETE 请求 - 删除试卷类型
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少试卷ID参数' },
        { status: 400 }
      );
    }
    
    // 不允许删除系统默认试卷
    if (id === 'default' || id === 'arknights') {
      return NextResponse.json(
        { error: '不能删除系统默认试卷' },
        { status: 403 }
      );
    }
    
    // 获取现有试卷类型
    const types = await getAllExamTypes();
    
    // 检查试卷是否存在
    if (!types.includes(id)) {
      return NextResponse.json(
        { error: '试卷不存在' },
        { status: 404 }
      );
    }
    
    // 更新试卷类型列表
    const updatedTypes = types.filter(type => type !== id);
    await saveExamTypes(updatedTypes);
    
    // 删除元数据文件
    await deleteExamMetadata(id);
    
    // 尝试删除配置文件
    try {
      const configPath = path.join(process.cwd(), 'public', 'data', 'experiment', `${id}.json`);
      await fs.unlink(configPath);
    } catch (error) {
      // 忽略文件可能不存在的错误
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: `已删除试卷类型 ${id}`
    });
  } catch (error) {
    console.error('删除试卷类型失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 