import { db } from '../index';
import { examMetadata, examQuestions, examTypes, examStartScreens, examResultModals } from '../schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

/**
 * 获取所有考试类型
 * @returns 考试类型列表
 */
export async function getAllExamTypes() {
  try {
    return await db.select().from(examTypes);
  } catch (error) {
    console.error('获取考试类型失败:', error);
    throw error;
  }
}

/**
 * 获取考试元数据
 * @param type 考试类型ID
 * @returns 考试元数据
 */
export async function getExamMetadata(type: string) {
  try {
    const metadata = await db.select().from(examMetadata).where(eq(examMetadata.id, type));
    if (metadata.length === 0) {
      throw new Error(`未找到考试类型: ${type}`);
    }
    return metadata[0];
  } catch (error) {
    console.error(`获取考试元数据失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 获取考试问题
 * @param type 考试类型ID
 * @returns 考试问题列表
 */
export async function getExamQuestions(type: string) {
  try {
    const questions = await db.select().from(examQuestions).where(eq(examQuestions.examTypeId, type));
    return { questions };
  } catch (error) {
    console.error(`获取考试问题失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 获取启动页配置
 * @param type 考试类型ID
 * @returns 启动页配置
 */
export async function getExamStartScreen(type: string) {
  try {
    const startScreen = await db.select().from(examStartScreens).where(eq(examStartScreens.id, type));
    if (startScreen.length > 0) {
      return startScreen[0];
    }
    return null;
  } catch (error) {
    console.error(`获取启动页配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 获取结果页配置
 * @param type 考试类型ID
 * @returns 结果页配置
 */
export async function getExamResultModal(type: string) {
  try {
    const resultModal = await db.select().from(examResultModals).where(eq(examResultModals.id, type));
    if (resultModal.length > 0) {
      return resultModal[0];
    }
    return null;
  } catch (error) {
    console.error(`获取结果页配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 保存启动页配置
 * @param type 考试类型ID
 * @param startScreen 启动页配置
 */
export async function saveExamStartScreen(type: string, startScreen: any) {
  try {
    // 检查是否已存在
    const existing = await db.select().from(examStartScreens).where(eq(examStartScreens.id, type));
    
    if (existing.length > 0) {
      // 更新现有记录
      await db.update(examStartScreens)
        .set({
          title: startScreen.title,
          description: startScreen.description,
          rules: startScreen.rules,
          buttonText: startScreen.buttonText,
          updatedAt: new Date()
        })
        .where(eq(examStartScreens.id, type));
    } else {
      // 创建新记录
      await db.insert(examStartScreens).values({
        id: type,
        title: startScreen.title,
        description: startScreen.description,
        rules: startScreen.rules,
        buttonText: startScreen.buttonText,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error(`保存启动页配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 保存结果页配置
 * @param type 考试类型ID
 * @param resultModal 结果页配置
 */
export async function saveExamResultModal(type: string, resultModal: any) {
  try {
    // 检查是否已存在
    const existing = await db.select().from(examResultModals).where(eq(examResultModals.id, type));
    
    if (existing.length > 0) {
      // 更新现有记录
      await db.update(examResultModals)
        .set({
          title: resultModal.title,
          showDelayTime: resultModal.showDelayTime,
          messages: resultModal.messages,
          buttonText: resultModal.buttonText,
          passingScore: resultModal.passingScore,
          updatedAt: new Date()
        })
        .where(eq(examResultModals.id, type));
    } else {
      // 创建新记录
      await db.insert(examResultModals).values({
        id: type,
        title: resultModal.title,
        showDelayTime: resultModal.showDelayTime,
        messages: resultModal.messages,
        buttonText: resultModal.buttonText,
        passingScore: resultModal.passingScore,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error(`保存结果页配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 获取完整考试配置
 * @param type 考试类型ID
 * @returns 完整考试配置，包括问题、启动页和结果页
 */
export async function getFullExamConfig(type: string) {
  try {
    // 获取所有组件
    const questionsResult = await getExamQuestions(type);
    let startScreen = await getExamStartScreen(type);
    let resultModal = await getExamResultModal(type);
    
    // 如果启动页或结果页为空，使用默认值
    if (!startScreen) {
      startScreen = {
        id: type,
        title: "考试标题",
        description: "考试描述",
        rules: {
          title: "考试须知：",
          items: ["请仔细阅读题目", "遵守考试规则"]
        },
        buttonText: "开始答题",
        updatedAt: new Date()
      };
    }
    
    if (!resultModal) {
      resultModal = {
        id: type,
        title: "考试结果",
        showDelayTime: 3000,
        messages: {
          pass: "恭喜通过考试！",
          fail: "很遗憾，未通过考试。"
        },
        buttonText: "关闭",
        passingScore: 60,
        updatedAt: new Date()
      };
    }
    
    // 返回完整配置
    return {
      questions: questionsResult.questions,
      startScreen,
      resultModal
    };
  } catch (error) {
    console.error(`获取完整考试配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 保存完整考试配置
 * @param type 考试类型ID
 * @param config 完整考试配置
 */
export async function saveFullExamConfig(type: string, config: any) {
  try {
    await db.transaction(async (tx) => {
      // 1. 删除并重新插入问题
      await tx.delete(examQuestions).where(eq(examQuestions.examTypeId, type));
      
      if (Array.isArray(config.questions)) {
        for (const question of config.questions) {
          await tx.insert(examQuestions).values({
            examTypeId: type,
            questionId: question.id,
            content: question.content,
            type: question.type,
            options: question.options,
            answer: question.answer || null,
            answers: question.answers || null,
            score: question.score || 1,
            specialEffect: question.specialEffect || null,
          });
        }
      }
      
      // 2. 更新启动页配置
      if (config.startScreen) {
        const startScreen = config.startScreen;
        const existingStartScreen = await tx.select().from(examStartScreens).where(eq(examStartScreens.id, type));
        
        if (existingStartScreen.length > 0) {
          await tx.update(examStartScreens)
            .set({
              title: startScreen.title,
              description: startScreen.description,
              rules: startScreen.rules,
              buttonText: startScreen.buttonText,
              updatedAt: new Date()
            })
            .where(eq(examStartScreens.id, type));
        } else {
          await tx.insert(examStartScreens).values({
            id: type,
            title: startScreen.title,
            description: startScreen.description,
            rules: startScreen.rules,
            buttonText: startScreen.buttonText,
            updatedAt: new Date()
          });
        }
      }
      
      // 3. 更新结果页配置
      if (config.resultModal) {
        const resultModal = config.resultModal;
        const existingResultModal = await tx.select().from(examResultModals).where(eq(examResultModals.id, type));
        
        if (existingResultModal.length > 0) {
          await tx.update(examResultModals)
            .set({
              title: resultModal.title,
              showDelayTime: resultModal.showDelayTime,
              messages: resultModal.messages,
              buttonText: resultModal.buttonText,
              passingScore: resultModal.passingScore,
              updatedAt: new Date()
            })
            .where(eq(examResultModals.id, type));
        } else {
          await tx.insert(examResultModals).values({
            id: type,
            title: resultModal.title,
            showDelayTime: resultModal.showDelayTime,
            messages: resultModal.messages,
            buttonText: resultModal.buttonText,
            passingScore: resultModal.passingScore,
            updatedAt: new Date()
          });
        }
      }
      
      // 4. 更新元数据的最后修改时间
      await tx
        .update(examMetadata)
        .set({ lastModified: new Date() })
        .where(eq(examMetadata.id, type));
    });
  } catch (error) {
    console.error(`保存完整考试配置失败 (${type}):`, error);
    throw error;
  }
}

/**
 * 从JSON文件初始化数据库
 * 将public/data/experiment中的数据导入到数据库
 */
export async function initializeDbFromJson() {
  try {
    console.log('开始从JSON文件初始化数据库...');
    
    // 读取考试类型
    const typesPath = path.join(process.cwd(), 'public', 'data', 'experiment', 'exam_types.json');
    const typesData = await fs.readFile(typesPath, 'utf-8');
    const examTypesList = JSON.parse(typesData) as string[];
    
    // 插入考试类型
    for (const typeId of examTypesList) {
      await db.insert(examTypes).values({
        id: typeId,
      }).onConflictDoNothing();
      
      console.log(`已添加考试类型: ${typeId}`);
      
      // 读取并插入元数据
      try {
        const metadataPath = path.join(process.cwd(), 'public', 'data', 'experiment', 'metadata', `${typeId}.json`);
        const metadataData = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataData);
        
        await db.insert(examMetadata).values({
          id: metadata.id,
          name: metadata.name,
          description: metadata.description || '',
          createdAt: new Date(metadata.createdAt),
          lastModified: new Date(metadata.lastModified),
        }).onConflictDoNothing();
        
        console.log(`已添加考试元数据: ${typeId}`);
      } catch (err) {
        console.warn(`未找到考试元数据 ${typeId}, 创建默认元数据`);
        // 如果没有元数据文件，创建默认元数据
        await db.insert(examMetadata).values({
          id: typeId,
          name: `${typeId} 考试`,
          description: '',
          createdAt: new Date(),
          lastModified: new Date(),
        }).onConflictDoNothing();
      }
      
      // 读取并处理考试配置文件
      const configPath = path.join(process.cwd(), 'public', 'data', 'experiment', `${typeId}.json`);
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      
      // 插入问题
      if (Array.isArray(config.questions)) {
        for (const question of config.questions) {
          await db.insert(examQuestions).values({
            examTypeId: typeId,
            questionId: question.id,
            content: question.content,
            type: question.type,
            options: question.options,
            answer: question.answer || null,
            answers: question.answers || null,
            score: question.score || 1,
            specialEffect: question.specialEffect || null,
          }).onConflictDoNothing();
        }
        console.log(`已添加 ${config.questions.length} 个考题到 ${typeId}`);
      }
      
      // 插入启动页配置
      if (config.startScreen) {
        await db.insert(examStartScreens).values({
          id: typeId,
          title: config.startScreen.title,
          description: config.startScreen.description,
          rules: config.startScreen.rules,
          buttonText: config.startScreen.buttonText,
          updatedAt: new Date()
        }).onConflictDoNothing();
        console.log(`已添加启动页配置到 ${typeId}`);
      }
      
      // 插入结果页配置
      if (config.resultModal) {
        await db.insert(examResultModals).values({
          id: typeId,
          title: config.resultModal.title,
          showDelayTime: config.resultModal.showDelayTime,
          messages: config.resultModal.messages,
          buttonText: config.resultModal.buttonText,
          passingScore: config.resultModal.passingScore,
          updatedAt: new Date()
        }).onConflictDoNothing();
        console.log(`已添加结果页配置到 ${typeId}`);
      }
    }
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('从JSON文件初始化数据库失败:', error);
    throw error;
  }
} 