import { ConfigData } from '../types';
import { mockQuestions, mockStartScreenData, mockResultModalData } from '../../_utils/mockData';

// 从静态文件加载配置
export const loadConfigurations = async (examId: string = 'default'): Promise<ConfigData> => {
  try {
    // 构建API URL，带上试卷类型参数
    const response = await fetch(`/api/testField/config?type=${encodeURIComponent(examId)}`);
    
    if (response.ok) {
      return await response.json();
    }
    
    // 如果静态文件不存在（404）
    if (response.status === 404) {
      // 尝试从localStorage加载作为备份
      try {
        // 使用examId作为键的一部分
        const storageKey = `examConfig_${examId}`;
        const savedConfig = localStorage.getItem(storageKey);
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          // 尝试将本地存储的配置保存到服务器
          await saveConfigurations(parsedConfig, examId);
          return parsedConfig;
        }
      } catch (error) {
        console.error('从localStorage加载配置失败:', error);
      }
    }
    
    // 如果所有尝试都失败，返回默认配置
    const defaultConfig = {
      questions: mockQuestions,
      startScreen: mockStartScreenData,
      resultModal: mockResultModalData
    };
    
    // 尝试保存默认配置到服务器
    await saveConfigurations(defaultConfig, examId);
    
    return defaultConfig;
  } catch (error) {
    console.error('加载配置失败:', error);
    
    // 出错时返回默认配置
    return {
      questions: mockQuestions,
      startScreen: mockStartScreenData,
      resultModal: mockResultModalData
    };
  }
};

// 保存配置到静态文件
export const saveConfigurations = async (config: ConfigData, examId: string = 'default'): Promise<void> => {
  try {
    // 首先保存到静态文件
    const response = await fetch(`/api/testField/config?type=${encodeURIComponent(examId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error('保存到服务器失败');
    }
    
    // 同时保存到 localStorage 作为备份
    const storageKey = `examConfig_${examId}`;
    localStorage.setItem(storageKey, JSON.stringify(config));
  } catch (error) {
    console.error('保存配置失败:', error);
    
    // 如果保存到服务器失败，尝试只保存到 localStorage
    try {
      const storageKey = `examConfig_${examId}`;
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (localError) {
      console.error('保存到localStorage也失败:', localError);
      throw error; // 抛出原始错误
    }
  }
};

// 导出配置为JSON文件
export const exportConfigurations = (config: ConfigData, examId: string = 'default'): void => {
  const dataStr = JSON.stringify(config, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const titlePart = config.startScreen?.title 
    ? config.startScreen.title.replace(/\s+/g, '_').slice(0, 20) 
    : '';
  const exportFileName = `exam_${examId}_${titlePart}_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
};

// 从文件导入配置
export const importConfigurations = async (file: File, examId: string = 'default'): Promise<ConfigData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        
        // 导入的同时保存到静态文件，指定试卷类型
        await saveConfigurations(config, examId);
        
        resolve(config);
      } catch (error) {
        reject(new Error('配置文件格式无效'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
};

// 保存配置为静态文件
export const saveAsStaticFile = async (config: ConfigData): Promise<void> => {
  try {
    const response = await fetch('/api/testField/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('保存配置文件失败');
    }
  } catch (error) {
    console.error('保存静态文件失败:', error);
    throw error;
  }
}; 