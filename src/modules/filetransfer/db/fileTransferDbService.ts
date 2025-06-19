/**
 * 文件传输数据库服务
 * 
 * 提供文件传输相关的数据库操作
 */

import { db } from '@/db';
import { fileTransfers } from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { FileTransfer, TransferStatus } from '../types';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

interface GetTransfersOptions {
  userId: string;
  page: number;
  limit: number;
  status?: TransferStatus;
}

interface CreateTransferOptions {
  file: File;
  userId: string;
}

export class FileTransferDbService {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = process.env.FILE_STORAGE_PATH || 'uploads';
  }

  /**
   * 获取文件传输列表
   */
  async getTransfers({ userId, page, limit, status }: GetTransfersOptions) {
    const offset = (page - 1) * limit;
    
    const query = db.select()
      .from(fileTransfers)
      .where(
        and(
          eq(fileTransfers.uploaderId, userId),
          status ? eq(fileTransfers.status, status) : undefined
        )
      )
      .orderBy(desc(fileTransfers.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  /**
   * 根据ID获取单个文件传输记录
   */
  async getTransferById(id: string, userId?: string) {
    const query = db.select()
      .from(fileTransfers)
      .where(
        and(
          eq(fileTransfers.id, id),
          userId ? eq(fileTransfers.uploaderId, userId) : undefined
        )
      );

    const [transfer] = await query;
    return transfer;
  }

  /**
   * 创建文件传输记录
   */
  async createTransfer({ file, userId }: CreateTransferOptions): Promise<FileTransfer> {
    const fileId = uuidv4();
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const filePath = join(this.storagePath, fileId);

    // 确保存储目录存在
    if (!existsSync(this.storagePath)) {
      await mkdir(this.storagePath, { recursive: true });
      console.log('📁 [FileTransferDbService] 创建存储目录:', this.storagePath);
    }

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // 创建数据库记录
    const [transfer] = await db.insert(fileTransfers)
      .values({
        id: fileId,
        fileName,
        fileType,
        fileSize,
        filePath,
        uploaderId: userId,
        status: 'completed',
        progress: 100,
        downloadCount: 0,
      })
      .returning();

    return {
      ...transfer,
      createdAt: transfer.createdAt.toISOString(),
      updatedAt: transfer.updatedAt.toISOString(),
      expiresAt: transfer.expiresAt?.toISOString(),
    };
  }

  /**
   * 删除文件传输记录
   */
  async deleteTransfer(id: string, userId: string): Promise<void> {
    // 获取传输记录
    const [transfer] = await db.select()
      .from(fileTransfers)
      .where(
        and(
          eq(fileTransfers.id, id),
          eq(fileTransfers.uploaderId, userId)
        )
      );

    if (!transfer) {
      throw new Error('传输记录不存在');
    }

    // 删除文件
    try {
      await unlink(transfer.filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }

    // 删除数据库记录
    await db.delete(fileTransfers)
      .where(
        and(
          eq(fileTransfers.id, id),
          eq(fileTransfers.uploaderId, userId)
        )
      );
  }

  /**
   * 更新下载次数
   */
  async incrementDownloadCount(id: string): Promise<void> {
    await db.update(fileTransfers)
      .set({
        downloadCount: sql`${fileTransfers.downloadCount} + 1`
      })
      .where(eq(fileTransfers.id, id));
  }
}

// 导出服务实例
export const fileTransferDbService = new FileTransferDbService(); 