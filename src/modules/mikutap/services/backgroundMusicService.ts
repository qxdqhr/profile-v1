import { db } from '../../../db';
import { mikutapBackgroundMusic } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface BackgroundMusicData {
  id?: string;
  configId: string;
  name: string;
  file: string;
  fileType: 'uploaded' | 'generated';
  volume: number;
  loop: boolean;
  bpm: number;
  isDefault: boolean;
  size?: number;
  duration?: number;
  generationConfig?: any;
  rhythmPattern?: any;
}

export class BackgroundMusicService {
  // 获取背景音乐列表
  static async getBackgroundMusics(configId: string = 'default') {
    try {
      const musics = await db
        .select()
        .from(mikutapBackgroundMusic)
        .where(eq(mikutapBackgroundMusic.configId, configId));
      
      return { success: true, data: musics };
    } catch (error) {
      console.error('获取背景音乐失败:', error);
      return { success: false, error: '获取背景音乐失败' };
    }
  }

  // 获取默认背景音乐
  static async getDefaultBackgroundMusic(configId: string = 'default') {
    try {
      const [defaultMusic] = await db
        .select()
        .from(mikutapBackgroundMusic)
        .where(
          and(
            eq(mikutapBackgroundMusic.configId, configId),
            eq(mikutapBackgroundMusic.isDefault, true)
          )
        );
      
      return { success: true, data: defaultMusic || null };
    } catch (error) {
      console.error('获取默认背景音乐失败:', error);
      return { success: false, error: '获取默认背景音乐失败' };
    }
  }

  // 创建背景音乐记录
  static async createBackgroundMusic(musicData: BackgroundMusicData) {
    try {
      const { configId, isDefault } = musicData;

      // 如果设置为默认，先取消其他默认音乐
      if (isDefault) {
        await db
          .update(mikutapBackgroundMusic)
          .set({ isDefault: false })
          .where(eq(mikutapBackgroundMusic.configId, configId));
      }

      // 插入新的背景音乐记录
      const [newMusic] = await db
        .insert(mikutapBackgroundMusic)
        .values({
          id: uuidv4(),
          ...musicData,
        })
        .returning();

      return { success: true, data: newMusic };
    } catch (error) {
      console.error('创建背景音乐失败:', error);
      return { success: false, error: '创建背景音乐失败' };
    }
  }

  // 更新背景音乐
  static async updateBackgroundMusic(
    id: string,
    configId: string,
    updateData: Partial<BackgroundMusicData>
  ) {
    try {
      const { isDefault } = updateData;

      // 如果设置为默认，先取消其他默认音乐
      if (isDefault) {
        await db
          .update(mikutapBackgroundMusic)
          .set({ isDefault: false })
          .where(eq(mikutapBackgroundMusic.configId, configId));
      }

      // 更新音乐记录
      const [updatedMusic] = await db
        .update(mikutapBackgroundMusic)
        .set({ ...updateData, updatedAt: new Date() })
        .where(
          and(
            eq(mikutapBackgroundMusic.id, id),
            eq(mikutapBackgroundMusic.configId, configId)
          )
        )
        .returning();

      if (!updatedMusic) {
        return { success: false, error: '音乐不存在' };
      }

      return { success: true, data: updatedMusic };
    } catch (error) {
      console.error('更新背景音乐失败:', error);
      return { success: false, error: '更新背景音乐失败' };
    }
  }

  // 删除背景音乐
  static async deleteBackgroundMusic(id: string, configId: string) {
    try {
      // 删除数据库记录
      const [deletedMusic] = await db
        .delete(mikutapBackgroundMusic)
        .where(
          and(
            eq(mikutapBackgroundMusic.id, id),
            eq(mikutapBackgroundMusic.configId, configId)
          )
        )
        .returning();

      if (!deletedMusic) {
        return { success: false, error: '音乐不存在' };
      }

      return { success: true, data: deletedMusic };
    } catch (error) {
      console.error('删除背景音乐失败:', error);
      return { success: false, error: '删除背景音乐失败' };
    }
  }

  // 设置默认背景音乐
  static async setDefaultBackgroundMusic(id: string, configId: string) {
    try {
      // 先取消所有默认音乐
      await db
        .update(mikutapBackgroundMusic)
        .set({ isDefault: false })
        .where(eq(mikutapBackgroundMusic.configId, configId));

      // 设置新的默认音乐
      const [updatedMusic] = await db
        .update(mikutapBackgroundMusic)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(mikutapBackgroundMusic.id, id),
            eq(mikutapBackgroundMusic.configId, configId)
          )
        )
        .returning();

      if (!updatedMusic) {
        return { success: false, error: '音乐不存在' };
      }

      return { success: true, data: updatedMusic };
    } catch (error) {
      console.error('设置默认背景音乐失败:', error);
      return { success: false, error: '设置默认背景音乐失败' };
    }
  }
} 