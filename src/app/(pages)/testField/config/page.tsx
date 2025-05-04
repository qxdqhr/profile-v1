'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { ConfigData } from './types';
import QuestionConfig from './components/QuestionConfig';
import StartScreenConfig from './components/StartScreenConfig';
import ResultsConfig from './components/ResultsConfig';
import { loadConfigurations, saveConfigurations, exportConfigurations, importConfigurations } from './utils/configStorage';
import { BackButton } from '@/app/_components/BackButton';
import { Question, StartScreenData, ResultModalData } from '../experiment/types';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('questions');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const data = await loadConfigurations();
        setConfig(data);
        setSaveMessage('配置已加载');
        setSaveStatus('success');
        setTimeout(() => {
          setSaveMessage('');
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('加载配置失败:', error);
        setSaveMessage('加载失败');
        setSaveStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    if (!config) return;

    setSaveStatus('saving');
    setSaveMessage('正在保存...');

    try {
      await saveConfigurations(config);
      setSaveMessage('配置已保存到服务器');
      setSaveStatus('success');
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage('保存失败，请重试');
      setSaveStatus('error');
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('idle');
      }, 5000);
    }
  };

  // 导出配置
  const handleExport = () => {
    if (!config) return;
    exportConfigurations(config);
  };

  // 导入配置
  const handleImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const data = await importConfigurations(file);
          setConfig(data);
          setSaveMessage('配置已导入');
          setTimeout(() => {
            setSaveMessage('');
          }, 3000);
        } catch (error) {
          console.error('导入配置失败:', error);
          setSaveMessage('导入失败');
        }
      }
    };
    fileInput.click();
  };

  // 更新问题配置
  const handleQuestionsChange = (questions: Question[]) => {
    if (!config) return;
    setConfig({
      ...config,
      questions
    });
  };

  // 更新启动页配置
  const handleStartScreenChange = (startScreen: StartScreenData) => {
    if (!config) return;
    setConfig({
      ...config,
      startScreen
    });
  };

  // 更新结果页配置
  const handleResultModalChange = (resultModal: ResultModalData) => {
    if (!config) return;
    setConfig({
      ...config,
      resultModal
    });
  };

  if (isLoading) {
    return <div className={styles.configContainer}>加载中...</div>;
  }

  if (!config) {
    return <div className={styles.configContainer}>无法加载配置数据</div>;
  }

  return (
    <div className={styles.configContainer}>
      <BackButton href="/testField" />
      
      <div className={styles.header}>
        <h1 className={styles.title}>考试系统配置</h1>
        <div className={styles.actions}>
          <button
            className={`${styles.saveButton} ${saveStatus === 'saving' ? styles.saving : ''}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存配置'}
          </button>
          <button
            className={styles.saveButton}
            onClick={handleExport}
            style={{ marginLeft: '8px' }}
          >
            导出配置
          </button>
          <button
            className={styles.saveButton}
            onClick={handleImport}
            style={{ marginLeft: '8px' }}
          >
            导入配置
          </button>
          {saveMessage && (
            <span className={`${styles.saveMessage} ${
              saveStatus === 'error' ? styles.errorMessage : 
              saveStatus === 'success' ? styles.successMessage : ''
            }`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabsTrigger} ${activeTab === 'questions' ? styles.active : ''}`}
            onClick={() => setActiveTab('questions')}
            data-state={activeTab === 'questions' ? 'active' : ''}
          >
            试题配置
          </button>
          <button
            className={`${styles.tabsTrigger} ${activeTab === 'startScreen' ? styles.active : ''}`}
            onClick={() => setActiveTab('startScreen')}
            data-state={activeTab === 'startScreen' ? 'active' : ''}
          >
            启动页配置
          </button>
          <button
            className={`${styles.tabsTrigger} ${activeTab === 'results' ? styles.active : ''}`}
            onClick={() => setActiveTab('results')}
            data-state={activeTab === 'results' ? 'active' : ''}
          >
            结果页配置
          </button>
        </div>

        <div className={styles.tabsContent}>
          {activeTab === 'questions' && (
            <QuestionConfig
              questions={config.questions}
              onQuestionsChange={handleQuestionsChange}
            />
          )}
          
          {activeTab === 'startScreen' && (
            <StartScreenConfig
              startScreenData={config.startScreen}
              onStartScreenChange={handleStartScreenChange}
            />
          )}
          
          {activeTab === 'results' && (
            <ResultsConfig
              resultModalData={config.resultModal}
              onResultModalChange={handleResultModalChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}