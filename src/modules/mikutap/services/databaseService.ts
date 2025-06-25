import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { mikutapConfigs, mikutapGridCells, mikutapSoundLibrary } from '../db/schema';
import { GridConfig, GridCell } from '../types';

// 保存配置到数据库
export async function saveGridConfigToDB(config: GridConfig): Promise<void> {
  try {
    // 开始事务
    await db.transaction(async (tx) => {
      // 更新或插入配置
      await tx.insert(mikutapConfigs)
        .values({
          id: config.id,
          name: config.name,
          description: config.description,
          rows: config.rows,
          cols: config.cols,
          soundLibrary: config.soundLibrary ? JSON.stringify(config.soundLibrary) : null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: mikutapConfigs.id,
          set: {
            name: config.name,
            description: config.description,
            rows: config.rows,
            cols: config.cols,
            soundLibrary: config.soundLibrary ? JSON.stringify(config.soundLibrary) : null,
            updatedAt: new Date(),
          },
        });

      // 删除现有的网格单元格
      await tx.delete(mikutapGridCells)
        .where(eq(mikutapGridCells.configId, config.id));

      // 插入新的网格单元格
      if (config.cells.length > 0) {
        await tx.insert(mikutapGridCells)
          .values(config.cells.map(cell => ({
            id: cell.id,
            configId: config.id,
            row: cell.row,
            col: cell.col,
            key: cell.key,
            soundType: cell.soundType,
            soundSource: cell.soundSource,
            waveType: cell.waveType,
            frequency: cell.frequency || null,
            volume: cell.volume || null,
            description: cell.description,
            icon: cell.icon,
            color: cell.color,
            enabled: cell.enabled,
            audioFile: cell.audioFile || null,
            effects: cell.effects ? JSON.stringify(cell.effects) : null,
          })));
      }
    });

    console.log('Configuration saved to database successfully');
  } catch (error) {
    console.error('Failed to save configuration to database:', error);
    throw error;
  }
}

// 从数据库加载配置
export async function loadGridConfigFromDB(configId: string = 'default'): Promise<GridConfig | null> {
  try {
    // 查询配置
    const configs = await db.select().from(mikutapConfigs)
      .where(eq(mikutapConfigs.id, configId));

    if (configs.length === 0) {
      return null;
    }

    const config = configs[0];

    // 查询网格单元格
    const cells = await db.select().from(mikutapGridCells)
      .where(eq(mikutapGridCells.configId, configId));

    // 转换为GridConfig格式
    const gridConfig: GridConfig = {
      id: config.id,
      name: config.name,
      description: config.description || '',
      rows: config.rows,
      cols: config.cols,
      cells: cells.map(cell => ({
        id: cell.id,
        row: cell.row,
        col: cell.col,
        key: cell.key,
        soundType: cell.soundType as any,
        soundSource: cell.soundSource as any,
        waveType: cell.waveType as any,
        frequency: cell.frequency || undefined,
        volume: cell.volume || undefined,
        description: cell.description,
        icon: cell.icon,
        color: cell.color,
        enabled: cell.enabled,
        audioFile: cell.audioFile || undefined,
        effects: cell.effects ? JSON.parse(cell.effects as string) : undefined,
      })),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      soundLibrary: config.soundLibrary ? JSON.parse(config.soundLibrary as string) : undefined,
    };

    return gridConfig;
  } catch (error) {
    console.error('Failed to load configuration from database:', error);
    throw error;
  }
}

// 获取所有配置列表
export async function getAllConfigsFromDB(): Promise<Array<Pick<GridConfig, 'id' | 'name' | 'description' | 'rows' | 'cols' | 'createdAt' | 'updatedAt'>>> {
  try {
    const configs = await db.select({
      id: mikutapConfigs.id,
      name: mikutapConfigs.name,
      description: mikutapConfigs.description,
      rows: mikutapConfigs.rows,
      cols: mikutapConfigs.cols,
      createdAt: mikutapConfigs.createdAt,
      updatedAt: mikutapConfigs.updatedAt,
    }).from(mikutapConfigs);

    return configs.map(config => ({
      ...config,
      description: config.description || '',
    }));
  } catch (error) {
    console.error('Failed to get all configurations from database:', error);
    throw error;
  }
}

// 删除配置
export async function deleteConfigFromDB(configId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 删除网格单元格（由于外键约束会自动删除）
      await tx.delete(mikutapGridCells)
        .where(eq(mikutapGridCells.configId, configId));
      
      // 删除音效库（由于外键约束会自动删除）
      await tx.delete(mikutapSoundLibrary)
        .where(eq(mikutapSoundLibrary.configId, configId));
      
      // 删除配置
      await tx.delete(mikutapConfigs)
        .where(eq(mikutapConfigs.id, configId));
    });

    console.log('Configuration deleted from database successfully');
  } catch (error) {
    console.error('Failed to delete configuration from database:', error);
    throw error;
  }
}

// 保存音效库项目
export async function saveSoundLibraryItem(configId: string, item: {
  id: string;
  name: string;
  file: string;
  type: string;
  description?: string;
  size?: number;
  duration?: number;
}): Promise<void> {
  try {
    await db.insert(mikutapSoundLibrary)
      .values({
        id: item.id,
        configId,
        name: item.name,
        file: item.file,
        type: item.type,
        description: item.description || null,
        size: item.size || null,
        duration: item.duration || null,
      })
      .onConflictDoUpdate({
        target: mikutapSoundLibrary.id,
        set: {
          name: item.name,
          file: item.file,
          type: item.type,
          description: item.description || null,
          size: item.size || null,
          duration: item.duration || null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Failed to save sound library item:', error);
    throw error;
  }
}

// 获取音效库列表
export async function getSoundLibraryFromDB(configId: string): Promise<Array<{
  id: string;
  name: string;
  file: string;
  type: string;
  description?: string;
  size?: number;
  duration?: number;
}>> {
  try {
    const items = await db.select().from(mikutapSoundLibrary)
      .where(eq(mikutapSoundLibrary.configId, configId));

    return items.map(item => ({
      id: item.id,
      name: item.name,
      file: item.file,
      type: item.type,
      description: item.description || undefined,
      size: item.size || undefined,
      duration: item.duration || undefined,
    }));
  } catch (error) {
    console.error('Failed to get sound library from database:', error);
    throw error;
  }
}

// 删除音效库项目
export async function deleteSoundLibraryItem(itemId: string): Promise<void> {
  try {
    await db.delete(mikutapSoundLibrary)
      .where(eq(mikutapSoundLibrary.id, itemId));
  } catch (error) {
    console.error('Failed to delete sound library item:', error);
    throw error;
  }
} 