import { ConfigData } from '../types';
import { mockQuestions, mockStartScreenData, mockResultModalData } from '../../experiment/mockData';

// 从本地存储加载配置
export const loadConfigurations = async (): Promise<ConfigData> => {
  // 尝试从localStorage加载
  try {
    const savedConfig = localStorage.getItem('examConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('从localStorage加载配置失败:', error);
  }

  // 返回默认配置
  return {
    questions: mockQuestions,
    startScreen: mockStartScreenData,
    resultModal: mockResultModalData
  };
};

// 保存配置到本地存储
export const saveConfigurations = async (config: ConfigData): Promise<void> => {
  try {
    localStorage.setItem('examConfig', JSON.stringify(config));
  } catch (error) {
    console.error('保存配置到localStorage失败:', error);
    throw error;
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
    
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
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