/**
 * MMD文件解析工具函数
 * 用于前端直接解析PMD/PMX文件，不依赖服务器上传
 */

export interface ParsedMMDResult {
  success: boolean;
  data?: any;
  error?: string;
  fileName: string;
  fileSize: number;
  format: 'PMD' | 'PMX' | 'VMD';
  type: 'model' | 'animation';
}

/**
 * 解析MMD文件
 * @param file File对象
 * @returns 解析结果
 */
export async function parseMMDFile(file: File): Promise<ParsedMMDResult> {
  try {
    console.log(`开始解析MMD文件: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    // 检查文件扩展名
    const fileName = file.name.toLowerCase();
    let format: 'PMD' | 'PMX' | 'VMD';
    
    if (fileName.endsWith('.pmx')) {
      format = 'PMX';
    } else if (fileName.endsWith('.pmd')) {
      format = 'PMD';
    } else if (fileName.endsWith('.vmd')) {
      format = 'VMD';
    } else {
      return {
        success: false,
        error: '不支持的文件格式，仅支持 .pmd, .pmx 和 .vmd 文件',
        fileName: file.name,
        fileSize: file.size,
        format: 'PMX', // 默认值
        type: 'model'
      };
    }

    // 读取文件为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 解析MMD文件
    let mmdData;
    
    try {
      // 使用动态导入并正确实例化Parser
      const mmdParserModule = await import('mmd-parser') as any;
      console.log('MMD Parser module keys:', Object.keys(mmdParserModule));
      
      // 尝试不同的方式获取Parser构造函数
      let ParserClass;
      if (mmdParserModule.Parser) {
        ParserClass = mmdParserModule.Parser;
      } else if (mmdParserModule.default && mmdParserModule.default.Parser) {
        ParserClass = mmdParserModule.default.Parser;
      } else if (mmdParserModule.MMDParser && mmdParserModule.MMDParser.Parser) {
        ParserClass = mmdParserModule.MMDParser.Parser;
      } else {
        console.error('找不到Parser类:', mmdParserModule);
        throw new Error('无法找到MMD Parser类，请检查mmd-parser库的安装');
      }
      
      const parser = new ParserClass();
      
      if (format === 'PMX') {
        mmdData = parser.parsePmx(arrayBuffer);
      } else if (format === 'PMD') {
        mmdData = parser.parsePmd(arrayBuffer);
      } else {
        mmdData = parser.parseVmd(arrayBuffer);
      }
    } catch (parseError: any) {
      console.error(`${format}文件解析失败:`, parseError);
      return {
        success: false,
        error: `解析失败: ${parseError?.message || parseError}`,
        fileName: file.name,
        fileSize: file.size,
        format,
        type: 'model'
      };
    }

    console.log(`${format}文件解析成功:`, {
      name: mmdData.metadata?.modelName || mmdData.header?.name || file.name,
      vertices: mmdData.vertices?.length || 0,
      faces: mmdData.faces?.length || 0,
      materials: mmdData.materials?.length || 0,
      // VMD特有的数据
      bones: mmdData.bone?.length || 0,
      morphs: mmdData.morph?.length || 0,
      cameras: mmdData.camera?.length || 0
    });

    return {
      success: true,
      data: mmdData,
      fileName: file.name,
      fileSize: file.size,
      format,
      type: format === 'VMD' ? 'animation' : 'model'
    };
    
  } catch (error: any) {
    console.error('MMD文件处理失败:', error);
    return {
      success: false,
      error: error?.message || '文件处理失败',
      fileName: file.name,
      fileSize: file.size,
      format: 'PMX', // 默认值
      type: 'model'
    };
  }
} 