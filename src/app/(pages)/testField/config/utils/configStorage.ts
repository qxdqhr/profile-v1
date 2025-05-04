import { ConfigData } from '../types';
import { mockQuestions, mockStartScreenData, mockResultModalData } from '../../experiment/mockData';

// 从静态文件加载配置
export const loadConfigurations = async (): Promise<ConfigData> => {
  try {
    // 尝试从静态文件加载
    const response = await fetch('/api/testField/config');
    
    if (response.ok) {
      return await response.json();
    }
    
    // 如果静态文件不存在（404）
    if (response.status === 404) {
      // 尝试从localStorage加载作为备份
      try {
        const savedConfig = localStorage.getItem('examConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          // 尝试将本地存储的配置保存到服务器
          await saveConfigurations(parsedConfig);
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
    await saveConfigurations(defaultConfig);
    
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
export const saveConfigurations = async (config: ConfigData): Promise<void> => {
  try {
    // 首先保存到静态文件
    const response = await fetch('/api/testField/config', {
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
    localStorage.setItem('examConfig', JSON.stringify(config));
  } catch (error) {
    console.error('保存配置失败:', error);
    
    // 如果保存到服务器失败，尝试只保存到 localStorage
    try {
      localStorage.setItem('examConfig', JSON.stringify(config));
    } catch (localError) {
      console.error('保存到localStorage也失败:', localError);
      throw error; // 抛出原始错误
    }
  }
};

// 导出配置为JSON文件
export const exportConfigurations = (config: ConfigData): void => {
  const dataStr = JSON.stringify(config, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileName = `exam_config_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
};

// 从文件导入配置
export const importConfigurations = async (file: File): Promise<ConfigData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        
        // 导入的同时保存到静态文件
        await saveConfigurations(config);
        
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

// 保存配置为静态文件（在实际开发中，这可能需要与服务器通信）
export const saveAsStaticFile = async (config: ConfigData): Promise<void> => {
  // 在实际应用中，这里应该发送配置到服务器端点
  // 在本示例中，我们只是模拟了这个过程
  console.log('保存为静态文件:', config);
  alert('此功能需要服务器支持。在真实环境中，这将把配置保存为静态文件。');
}; 