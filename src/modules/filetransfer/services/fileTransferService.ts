 /**
 * 文件传输业务逻辑服务
 * 
 * 提供文件传输相关的业务逻辑处理
 */

import { fileTransferDbService } from '../db/fileTransferDbService';
import type { FileTransfer, FileTransferConfig, TransferStatus } from '../types';
import { validateFileType, validateFileSize } from '../utils/fileValidation';

export class FileTransferService {
  
  /**
   * 验证文件是否符合上传要求
   */
  async validateFile(file: File, config?: FileTransferConfig): Promise<{
    valid: boolean;
    message?: string;
  }> {
    console.log('🔍 [FileTransferService] 验证文件:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });

    // 获取配置（如果没有提供）
    if (!config) {
      config = await this.getDefaultConfig();
    }

    // 验证文件大小
    if (!validateFileSize(file.size, config.maxFileSize)) {
      const maxSizeMB = Math.round(config.maxFileSize / 1024 / 1024);
      return {
        valid: false,
        message: `文件大小不能超过 ${maxSizeMB}MB`
      };
    }

    // 验证文件类型
    if (!validateFileType(file.type, config.allowedFileTypes)) {
      return {
        valid: false,
        message: '不支持的文件类型'
      };
    }

    console.log('✅ [FileTransferService] 文件验证通过');
    return { valid: true };
  }

  /**
   * 处理文件上传
   */
  async uploadFile(file: File, userId: string): Promise<FileTransfer> {
    console.log('📤 [FileTransferService] 开始处理文件上传');

    // 验证文件
    const validation = await this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      // 创建传输记录
      const transfer = await fileTransferDbService.createTransfer({
        file,
        userId
      });

      console.log('✅ [FileTransferService] 文件上传成功:', transfer.id);
      return transfer;
      
    } catch (error) {
      console.error('💥 [FileTransferService] 文件上传失败:', error);
      throw new Error('文件上传失败');
    }
  }

  /**
   * 获取用户的文件传输列表
   */
  async getUserTransfers(
    userId: string, 
    options: {
      page?: number;
      limit?: number;
      status?: TransferStatus;
    } = {}
  ): Promise<FileTransfer[]> {
    console.log('📋 [FileTransferService] 获取用户传输列表:', { userId, options });

    const { page = 1, limit = 10, status } = options;

    try {
      const transfers = await fileTransferDbService.getTransfers({
        userId,
        page,
        limit,
        status
      });

      // Convert Date objects to strings to match FileTransfer interface
      const formattedTransfers = transfers.map(transfer => ({
        ...transfer,
        createdAt: transfer.createdAt.toISOString(),
        updatedAt: transfer.updatedAt.toISOString(),
        expiresAt: transfer.expiresAt?.toISOString()
      }));

      console.log('✅ [FileTransferService] 获取传输列表成功:', formattedTransfers.length);
      return formattedTransfers;
      
    } catch (error) {
      console.error('💥 [FileTransferService] 获取传输列表失败:', error);
      throw new Error('获取传输列表失败');
    }
  }

  /**
   * 删除文件传输记录
   */
  async deleteTransfer(transferId: string, userId: string): Promise<void> {
    console.log('🗑️ [FileTransferService] 删除传输记录:', { transferId, userId });

    try {
      await fileTransferDbService.deleteTransfer(transferId, userId);
      console.log('✅ [FileTransferService] 传输记录删除成功');
      
    } catch (error) {
      console.error('💥 [FileTransferService] 删除传输记录失败:', error);
      throw new Error('删除传输记录失败');
    }
  }

  /**
   * 记录文件下载
   */
  async recordDownload(transferId: string): Promise<void> {
    console.log('📥 [FileTransferService] 记录文件下载:', transferId);

    try {
      await fileTransferDbService.incrementDownloadCount(transferId);
      console.log('✅ [FileTransferService] 下载记录更新成功');
      
    } catch (error) {
      console.error('💥 [FileTransferService] 下载记录更新失败:', error);
      throw new Error('下载记录更新失败');
    }
  }

  /**
   * 获取默认配置
   */
  async getDefaultConfig(): Promise<FileTransferConfig> {
    return {
      id: 'default',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
      allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/json',
        'application/javascript',
        'text/css',
        'text/html'
      ],
      defaultExpirationDays: parseInt(process.env.DEFAULT_EXPIRATION_DAYS || '7'),
      enableEncryption: process.env.ENABLE_ENCRYPTION === 'true',
      enableCompression: process.env.ENABLE_COMPRESSION === 'true',
      storagePath: process.env.FILE_STORAGE_PATH || 'uploads'
    };
  }

  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(): Promise<void> {
    console.log('🧹 [FileTransferService] 开始清理过期文件');
    
    // TODO: 实现过期文件清理逻辑
    // 1. 查询过期的文件记录
    // 2. 删除物理文件
    // 3. 删除数据库记录
    
    console.log('✅ [FileTransferService] 过期文件清理完成');
  }
}

// 导出服务实例
export const fileTransferService = new FileTransferService();