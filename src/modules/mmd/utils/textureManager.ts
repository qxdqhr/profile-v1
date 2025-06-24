/**
 * MMD纹理管理器
 * 处理PMX模型的纹理文件加载和映射
 */

import type { TextureFileInfo, MMDTextureManager } from '../types';

export class TextureManager implements MMDTextureManager {
  public textureFiles: Map<string, TextureFileInfo> = new Map();

  /**
   * 添加纹理文件
   */
  addTexture(file: File): void {
    const fileName = file.name; // 保持原始文件名
    const url = URL.createObjectURL(file);
    
    const textureInfo: TextureFileInfo = {
      file,
      url,
      name: file.name,
      size: file.size
    };

    this.textureFiles.set(fileName, textureInfo);
    console.log(`📁 添加纹理文件: "${file.name}", 大小: ${(file.size / 1024).toFixed(1)}KB`);
  }

  /**
   * 获取纹理文件的URL
   * @param texturePath 纹理路径
   * @returns 纹理URL或null
   */
  getTextureUrl(texturePath: string): string | null {
    if (!texturePath) {
      console.log('⚠️ 纹理路径为空');
      return null;
    }

    console.log(`🔍 查找纹理: "${texturePath}"`);
    console.log(`📋 当前可用纹理:`, this.listTextures());

    // 1. 完整路径精确匹配
    if (this.textureFiles.has(texturePath)) {
      const url = this.textureFiles.get(texturePath)!.url;
      console.log(`✅ 完整路径精确匹配: "${texturePath}"`);
      return url;
    }

    // 提取请求的文件名（去除路径）
    const requestedFilename = texturePath.split(/[/\\]/).pop() || texturePath;
    console.log(`🔍 提取文件名: "${requestedFilename}"`);

    // 2. 文件名精确匹配（保持大小写）
    for (const [storedName, textureInfo] of this.textureFiles) {
      if (storedName === requestedFilename) {
        console.log(`✅ 文件名精确匹配: "${requestedFilename}" -> "${storedName}"`);
        return textureInfo.url;
      }
    }

    // 3. 文件名大小写不敏感匹配
    const lowerRequestedName = requestedFilename.toLowerCase();
    for (const [storedName, textureInfo] of this.textureFiles) {
      if (storedName.toLowerCase() === lowerRequestedName) {
        console.log(`✅ 大小写不敏感匹配: "${requestedFilename}" -> "${storedName}"`);
        return textureInfo.url;
      }
    }

    // 4. 去除扩展名后匹配（处理不同格式的情况，如jpg vs png）
    const requestedBaseName = requestedFilename.replace(/\.[^.]*$/, '').toLowerCase();
    console.log(`🔍 尝试基名匹配: "${requestedBaseName}"`);
    
    for (const [storedName, textureInfo] of this.textureFiles) {
      const storedBaseName = storedName.replace(/\.[^.]*$/, '').toLowerCase();
      if (storedBaseName === requestedBaseName) {
        console.log(`✅ 基名匹配成功: "${requestedFilename}" -> "${storedName}"`);
        return textureInfo.url;
      }
    }

    // 5. 子串匹配（最后的尝试）
    console.log(`🔍 尝试子串匹配...`);
    for (const [storedName, textureInfo] of this.textureFiles) {
      const storedLower = storedName.toLowerCase();
      const requestedLower = requestedFilename.toLowerCase();
      
      if (storedLower.includes(requestedLower) || requestedLower.includes(storedLower)) {
        console.log(`✅ 子串匹配成功: "${requestedFilename}" -> "${storedName}"`);
        return textureInfo.url;
      }
    }

    console.warn(`❌ 未找到匹配的纹理文件: "${texturePath}"`);
    console.log(`📋 可用纹理详细列表:`);
    this.textureFiles.forEach((info, name) => {
      console.log(`  - "${name}" (原始: "${info.name}")`);
    });
    return null;
  }

  /**
   * 清理所有纹理文件
   */
  clear(): void {
    // 释放所有URL对象
    this.textureFiles.forEach(info => {
      URL.revokeObjectURL(info.url);
    });
    this.textureFiles.clear();
    console.log('已清理所有纹理文件');
  }

  /**
   * 获取纹理文件统计信息
   */
  getStats() {
    const count = this.textureFiles.size;
    const totalSize = Array.from(this.textureFiles.values())
      .reduce((sum, info) => sum + info.size, 0);
    
    return {
      count,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * 列出所有纹理文件
   */
  listTextures(): string[] {
    return Array.from(this.textureFiles.keys());
  }
} 