import { db } from '@/db';
import { 
  mmdModels, 
  mmdAnimations, 
  mmdAudios, 
  mmdScenes,
  mmdModelFavorites,
  mmdAnimationFavorites 
} from './schema';
import { eq, desc, and, inArray, like, or } from 'drizzle-orm';
import type { 
  MMDModel, 
  MMDAnimation, 
  MMDAudio, 
  MMDScene,
  ModelUploadFormData,
  AnimationUploadFormData,
  SceneSaveFormData
} from '../types';

/**
 * MMD模型数据库服务
 */
export class MMDModelsDbService {
  /**
   * 获取所有公开的模型
   */
  async getPublicModels(): Promise<MMDModel[]> {
    const result = await db
      .select()
      .from(mmdModels)
      .where(eq(mmdModels.isPublic, true))
      .orderBy(desc(mmdModels.uploadTime));

    return result.map(this.formatModel);
  }

  /**
   * 获取用户的模型
   */
  async getUserModels(userId: number): Promise<MMDModel[]> {
    const result = await db
      .select()
      .from(mmdModels)
      .where(eq(mmdModels.userId, userId))
      .orderBy(desc(mmdModels.uploadTime));

    return result.map(this.formatModel);
  }

  /**
   * 根据ID获取模型
   */
  async getModelById(id: number): Promise<MMDModel | null> {
    const result = await db
      .select()
      .from(mmdModels)
      .where(eq(mmdModels.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.formatModel(result[0]);
  }

  /**
   * 搜索模型
   */
  async searchModels(query: string, userId?: number): Promise<MMDModel[]> {
    const conditions = [
      like(mmdModels.name, `%${query}%`),
      like(mmdModels.description, `%${query}%`)
    ];

    // 如果提供了用户ID，则包含用户的私有模型
    const whereCondition = userId 
      ? and(
          or(...conditions),
          or(
            eq(mmdModels.isPublic, true),
            eq(mmdModels.userId, userId)
          )
        )
      : and(or(...conditions), eq(mmdModels.isPublic, true));

    const result = await db
      .select()
      .from(mmdModels)
      .where(whereCondition)
      .orderBy(desc(mmdModels.uploadTime));

    return result.map(this.formatModel);
  }

  /**
   * 创建新模型
   */
  async createModel(data: {
    name: string;
    description?: string;
    filePath: string;
    thumbnailPath?: string;
    fileSize: number;
    format: 'pmd' | 'pmx';
    userId?: number;
    tags?: string[];
    isPublic: boolean;
  }): Promise<MMDModel> {
    const result = await db
      .insert(mmdModels)
      .values({
        ...data,
        downloadCount: 0,
      })
      .returning();

    return this.formatModel(result[0]);
  }

  /**
   * 更新模型
   */
  async updateModel(id: number, data: Partial<Omit<MMDModel, 'id' | 'uploadTime'>>): Promise<MMDModel | null> {
    // 将字符串ID转换为数字ID并过滤掉不需要的字段
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.uploadTime;
    if (updateData.userId) {
      updateData.userId = parseInt(updateData.userId);
    }

    const result = await db
      .update(mmdModels)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(mmdModels.id, id))
      .returning();

    if (result.length === 0) return null;
    return this.formatModel(result[0]);
  }

  /**
   * 删除模型
   */
  async deleteModel(id: number): Promise<boolean> {
    const result = await db
      .delete(mmdModels)
      .where(eq(mmdModels.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id: number): Promise<void> {
    const model = await this.getModelById(id);
    if (model) {
      await db
        .update(mmdModels)
        .set({
          downloadCount: (parseInt(model.downloadCount.toString()) || 0) + 1,
        })
        .where(eq(mmdModels.id, id));
    }
  }

  /**
   * 格式化模型数据
   */
  private formatModel(row: any): MMDModel {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      filePath: row.filePath,
      thumbnailPath: row.thumbnailPath,
      fileSize: row.fileSize,
      uploadTime: row.uploadTime,
      format: row.format,
      userId: row.userId?.toString(),
      tags: row.tags || [],
      isPublic: row.isPublic,
      downloadCount: row.downloadCount,
    };
  }
}

/**
 * MMD动画数据库服务
 */
export class MMDAnimationsDbService {
  /**
   * 获取所有公开的动画
   */
  async getPublicAnimations(): Promise<MMDAnimation[]> {
    const result = await db
      .select()
      .from(mmdAnimations)
      .where(eq(mmdAnimations.isPublic, true))
      .orderBy(desc(mmdAnimations.uploadTime));

    return result.map(this.formatAnimation);
  }

  /**
   * 获取用户的动画
   */
  async getUserAnimations(userId: number): Promise<MMDAnimation[]> {
    const result = await db
      .select()
      .from(mmdAnimations)
      .where(eq(mmdAnimations.userId, userId))
      .orderBy(desc(mmdAnimations.uploadTime));

    return result.map(this.formatAnimation);
  }

  /**
   * 根据ID获取动画
   */
  async getAnimationById(id: number): Promise<MMDAnimation | null> {
    const result = await db
      .select()
      .from(mmdAnimations)
      .where(eq(mmdAnimations.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.formatAnimation(result[0]);
  }

  /**
   * 创建新动画
   */
  async createAnimation(data: {
    name: string;
    description?: string;
    filePath: string;
    fileSize: number;
    duration: number;
    frameCount: number;
    userId?: number;
    tags?: string[];
    isPublic: boolean;
    compatibleModels?: string[];
  }): Promise<MMDAnimation> {
    const result = await db
      .insert(mmdAnimations)
      .values(data)
      .returning();

    return this.formatAnimation(result[0]);
  }

  /**
   * 更新动画
   */
  async updateAnimation(id: number, data: Partial<Omit<MMDAnimation, 'id' | 'uploadTime'>>): Promise<MMDAnimation | null> {
    // 将字符串ID转换为数字ID并过滤掉不需要的字段
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.uploadTime;
    if (updateData.userId) {
      updateData.userId = parseInt(updateData.userId);
    }

    const result = await db
      .update(mmdAnimations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(mmdAnimations.id, id))
      .returning();

    if (result.length === 0) return null;
    return this.formatAnimation(result[0]);
  }

  /**
   * 删除动画
   */
  async deleteAnimation(id: number): Promise<boolean> {
    const result = await db
      .delete(mmdAnimations)
      .where(eq(mmdAnimations.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * 格式化动画数据
   */
  private formatAnimation(row: any): MMDAnimation {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      filePath: row.filePath,
      fileSize: row.fileSize,
      uploadTime: row.uploadTime,
      duration: row.duration,
      frameCount: row.frameCount,
      userId: row.userId?.toString(),
      tags: row.tags || [],
      isPublic: row.isPublic,
      compatibleModels: row.compatibleModels || [],
    };
  }
}

/**
 * MMD音频数据库服务
 */
export class MMDAudiosDbService {
  /**
   * 获取用户的音频
   */
  async getUserAudios(userId: number): Promise<MMDAudio[]> {
    const result = await db
      .select()
      .from(mmdAudios)
      .where(eq(mmdAudios.userId, userId))
      .orderBy(desc(mmdAudios.uploadTime));

    return result.map(this.formatAudio);
  }

  /**
   * 根据ID获取音频
   */
  async getAudioById(id: number): Promise<MMDAudio | null> {
    const result = await db
      .select()
      .from(mmdAudios)
      .where(eq(mmdAudios.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.formatAudio(result[0]);
  }

  /**
   * 创建新音频
   */
  async createAudio(data: {
    name: string;
    filePath: string;
    fileSize: number;
    duration: number;
    format: 'wav' | 'mp3' | 'ogg';
    userId?: number;
  }): Promise<MMDAudio> {
    const result = await db
      .insert(mmdAudios)
      .values(data)
      .returning();

    return this.formatAudio(result[0]);
  }

  /**
   * 删除音频
   */
  async deleteAudio(id: number): Promise<boolean> {
    const result = await db
      .delete(mmdAudios)
      .where(eq(mmdAudios.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * 格式化音频数据
   */
  private formatAudio(row: any): MMDAudio {
    return {
      id: row.id.toString(),
      name: row.name,
      filePath: row.filePath,
      fileSize: row.fileSize,
      uploadTime: row.uploadTime,
      duration: row.duration,
      format: row.format,
      userId: row.userId?.toString(),
    };
  }
}

/**
 * MMD场景数据库服务
 */
export class MMDScenesDbService {
  /**
   * 获取用户的场景
   */
  async getUserScenes(userId: number): Promise<MMDScene[]> {
    const result = await db
      .select()
      .from(mmdScenes)
      .where(eq(mmdScenes.userId, userId))
      .orderBy(desc(mmdScenes.createdAt));

    return result.map(this.formatScene);
  }

  /**
   * 根据ID获取场景
   */
  async getSceneById(id: number): Promise<MMDScene | null> {
    const result = await db
      .select()
      .from(mmdScenes)
      .where(eq(mmdScenes.id, id))
      .limit(1);

    if (result.length === 0) return null;
    return this.formatScene(result[0]);
  }

  /**
   * 创建新场景
   */
  async createScene(data: {
    name: string;
    description?: string;
    modelId: number;
    animationId?: number;
    audioId?: number;
    cameraPosition: { x: number; y: number; z: number };
    cameraTarget: { x: number; y: number; z: number };
    lighting: any;
    background: any;
    userId?: number;
  }): Promise<MMDScene> {
    const result = await db
      .insert(mmdScenes)
      .values(data)
      .returning();

    return this.formatScene(result[0]);
  }

  /**
   * 更新场景
   */
  async updateScene(id: number, data: Partial<Omit<MMDScene, 'id' | 'createdAt'>>): Promise<MMDScene | null> {
    // 将字符串ID转换为数字ID并过滤掉不需要的字段
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    if (updateData.userId) {
      updateData.userId = parseInt(updateData.userId);
    }
    if (updateData.modelId) {
      updateData.modelId = parseInt(updateData.modelId);
    }
    if (updateData.animationId) {
      updateData.animationId = parseInt(updateData.animationId);
    }
    if (updateData.audioId) {
      updateData.audioId = parseInt(updateData.audioId);
    }

    const result = await db
      .update(mmdScenes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(mmdScenes.id, id))
      .returning();

    if (result.length === 0) return null;
    return this.formatScene(result[0]);
  }

  /**
   * 删除场景
   */
  async deleteScene(id: number): Promise<boolean> {
    const result = await db
      .delete(mmdScenes)
      .where(eq(mmdScenes.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * 格式化场景数据
   */
  private formatScene(row: any): MMDScene {
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      modelId: row.modelId.toString(),
      animationId: row.animationId?.toString(),
      audioId: row.audioId?.toString(),
      cameraPosition: row.cameraPosition,
      cameraTarget: row.cameraTarget,
      lighting: row.lighting,
      background: row.background,
      userId: row.userId?.toString(),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// 导出服务实例
export const mmdModelsDbService = new MMDModelsDbService();
export const mmdAnimationsDbService = new MMDAnimationsDbService();
export const mmdAudiosDbService = new MMDAudiosDbService();
export const mmdScenesDbService = new MMDScenesDbService(); 