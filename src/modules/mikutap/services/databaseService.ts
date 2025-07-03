import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { mikutapConfigs, mikutapGridCells, mikutapSoundLibrary } from '../db/schema';
import { GridConfig, GridCell } from '../types';

// 保存配置到数据库
export async function saveGridConfigToDB(config: GridConfig): Promise<void> {
  try {
    // 准备数据，安全地处理可能不存在的字段
    const configData = {
      id: config.id,
      name: config.name,
      description: config.description,
      rows: config.rows,
      cols: config.cols,
      soundLibrary: config.soundLibrary ? JSON.stringify(config.soundLibrary) : null,
      updatedAt: new Date(),
    };
    
    // 安全地序列化interfaceSettings
    let interfaceSettingsJson = null;
    if (config.interfaceSettings) {
      try {
        interfaceSettingsJson = JSON.stringify(config.interfaceSettings);
        console.log('成功序列化interfaceSettings:', interfaceSettingsJson);
      } catch (error) {
        console.error('序列化interfaceSettings失败:', error);
        interfaceSettingsJson = null;
      }
    }
    
    // 只有当interfaceSettings存在时才添加该字段
    const configDataWithInterface = interfaceSettingsJson 
      ? { ...configData, interfaceSettings: interfaceSettingsJson }
      : configData;

    // 开始事务
    await db.transaction(async (tx) => {
      // 更新或插入配置
      await tx.insert(mikutapConfigs)
        .values(configDataWithInterface)
        .onConflictDoUpdate({
          target: mikutapConfigs.id,
          set: configDataWithInterface,
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
            // 动画字段
            animationEnabled: cell.animationEnabled ?? true,
            animationType: cell.animationType || 'pulse',
            animationData: cell.animationData ? JSON.stringify(cell.animationData) : null,
            animationConfig: cell.animationConfig ? JSON.stringify(cell.animationConfig) : null,
          })));
      }
    });

    console.log('Configuration saved to database successfully');
  } catch (error) {
    console.error('Failed to save configuration to database:', error);
    
    // 如果是因为interfaceSettings字段不存在导致的错误，给出更友好的提示
    if (error instanceof Error && (
      error.message.includes('column') && error.message.includes('does not exist') ||
      error.message.includes('interface_settings')
    )) {
      console.warn('数据库字段不存在，可能需要运行数据库迁移: pnpm drizzle-kit generate && pnpm drizzle-kit push');
      
      // 尝试不保存新字段
      try {
        const basicConfigData = {
          id: config.id,
          name: config.name,
          description: config.description,
          rows: config.rows,
          cols: config.cols,
          soundLibrary: config.soundLibrary ? JSON.stringify(config.soundLibrary) : null,
          updatedAt: new Date(),
        };

        await db.transaction(async (tx) => {
          // 尝试只保存基础字段
          await tx.insert(mikutapConfigs)
            .values(basicConfigData)
            .onConflictDoUpdate({
              target: mikutapConfigs.id,
              set: basicConfigData,
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
                // 动画字段
                animationEnabled: cell.animationEnabled ?? true,
                animationType: cell.animationType || 'pulse',
                animationData: cell.animationData ? JSON.stringify(cell.animationData) : null,
                animationConfig: cell.animationConfig ? JSON.stringify(cell.animationConfig) : null,
              })));
          }
        });

        console.warn('配置已保存，但interfaceSettings字段被跳过。请运行数据库迁移以支持完整功能。');
        return;
      } catch (fallbackError) {
        console.error('基础保存也失败:', fallbackError);
      }
    }
    
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
        key: cell.key || undefined,
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
        // 动画字段
        animationEnabled: cell.animationEnabled ?? true,
        animationType: (cell.animationType || 'pulse') as any,
        animationData: (() => {
          if (!cell.animationData) return undefined;
          return typeof cell.animationData === 'string' ? JSON.parse(cell.animationData) : (cell.animationData as any);
        })(),
        animationConfig: (() => {
          if (!cell.animationConfig) return undefined;
          return typeof cell.animationConfig === 'string' ? JSON.parse(cell.animationConfig) : (cell.animationConfig as any);
        })(),
      })),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      soundLibrary: config.soundLibrary ? JSON.parse(config.soundLibrary as string) : undefined,
      interfaceSettings: (() => {
        try {
          // 安全地处理可能不存在的interfaceSettings字段
          if (config.interfaceSettings !== undefined && config.interfaceSettings !== null) {
            // 如果已经是对象，直接返回
            if (typeof config.interfaceSettings === 'object') {
              return config.interfaceSettings;
            }
            
            // 确保是字符串类型才处理
            if (typeof config.interfaceSettings === 'string') {
              const rawValue = config.interfaceSettings;
              
              // 检查是否是 "[object Object]" 这种错误格式
              if (rawValue === '[object Object]' || rawValue.startsWith('[object ')) {
                console.warn('检测到错误的对象字符串格式，返回undefined:', rawValue);
                return undefined;
              }
              
              // 尝试解析JSON字符串
              return JSON.parse(rawValue);
            }
            
            // 其他类型直接返回undefined
            console.warn('interfaceSettings是未知类型，返回undefined:', typeof config.interfaceSettings, config.interfaceSettings);
            return undefined;
          }
          return undefined;
        } catch (error) {
          console.warn('Failed to parse interfaceSettings, using undefined:', error);
          return undefined;
        }
      })(),
    };

    return gridConfig;
  } catch (error) {
    console.error('Failed to load configuration from database:', error);
    
    // 如果是字段不存在的错误（通常是数据库schema不匹配），尝试返回一个基础配置
    if (error instanceof Error && error.message.includes('column') && error.message.includes('does not exist')) {
      console.warn('数据库字段不存在，可能需要运行数据库迁移。尝试返回基础配置...');
      
      try {
        // 尝试查询基础字段
        const basicConfigs = await db.select({
          id: mikutapConfigs.id,
          name: mikutapConfigs.name,
          description: mikutapConfigs.description,
          rows: mikutapConfigs.rows,
          cols: mikutapConfigs.cols,
          createdAt: mikutapConfigs.createdAt,
          updatedAt: mikutapConfigs.updatedAt,
        }).from(mikutapConfigs)
          .where(eq(mikutapConfigs.id, configId));

        if (basicConfigs.length > 0) {
          const basicConfig = basicConfigs[0];
          
          console.warn('返回不包含新字段的基础配置');
          return {
            id: basicConfig.id,
            name: basicConfig.name,
            description: basicConfig.description || '',
            rows: basicConfig.rows,
            cols: basicConfig.cols,
            cells: [], // 空的cells数组
            createdAt: basicConfig.createdAt,
            updatedAt: basicConfig.updatedAt,
            soundLibrary: undefined,
            interfaceSettings: undefined, // 新字段设为undefined
          };
        }
      } catch (fallbackError) {
        console.error('基础配置查询也失败:', fallbackError);
      }
    }
    
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

// 清理数据库中错误的interfaceSettings数据
export async function cleanupInvalidInterfaceSettings(): Promise<void> {
  try {
    console.log('开始清理无效的interfaceSettings数据...');
    
    // 查询所有配置
    const allConfigs = await db.select().from(mikutapConfigs);
    
    let cleanedCount = 0;
    
    for (const config of allConfigs) {
      if (config.interfaceSettings !== null) {
        let shouldClean = false;
        const rawValue = config.interfaceSettings;
        
        // 检查是否是无效的数据格式
        if (typeof rawValue === 'string') {
          // 字符串类型的无效格式
          if (rawValue === '[object Object]' || 
              rawValue.startsWith('[object ') ||
              rawValue === 'undefined' ||
              rawValue === 'null' ||
              rawValue.trim() === '') {
            shouldClean = true;
          } else {
            // 尝试解析JSON，如果失败也清理
            try {
              JSON.parse(rawValue);
            } catch (error) {
              console.log(`JSON解析失败，需要清理: ${rawValue}`);
              shouldClean = true;
            }
          }
        } else if (typeof rawValue !== 'object') {
          // 非对象非字符串类型也需要清理
          console.log(`无效类型，需要清理: ${typeof rawValue}`, rawValue);
          shouldClean = true;
        }
        
        if (shouldClean) {
          console.log(`清理配置 ${config.id} 的无效interfaceSettings: ${JSON.stringify(rawValue)}`);
          
          // 将无效的interfaceSettings设置为null
          await db.update(mikutapConfigs)
            .set({ interfaceSettings: null })
            .where(eq(mikutapConfigs.id, config.id));
          
          cleanedCount++;
        }
      }
    }
    
    console.log(`清理完成，共处理了 ${cleanedCount} 个无效的interfaceSettings记录`);
  } catch (error) {
    console.error('清理interfaceSettings数据时发生错误:', error);
  }
} 