'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { ConfigData } from './types';
import QuestionConfig from './_components/QuestionConfig';
import StartScreenConfig from './_components/StartScreenConfig';
import ResultsConfig from './_components/ResultsConfig';
import { loadConfigurations, saveConfigurations, exportConfigurations, importConfigurations } from './_utils/configStorage';
import { BackButton } from '@/app/_components/BackButton';
import { Question, StartScreenData, ResultModalData } from '../_types';
import { EXAM_TYPE_MAP } from './types';

// 试卷类型下拉选项
const EXAM_TYPE_OPTIONS = [
  { value: 'default', label: '通用考试' },
  { value: 'arknights', label: '明日方舟测试' },
  // 可以继续添加更多选项
];

export default function ConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examType = searchParams.get('type') || 'default';
  
  const [activeTab, setActiveTab] = useState('questions');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // 切换试卷类型
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    router.push(`/testField/experiment/config?type=${newType}`);
  };

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setSaveMessage('');
      setSaveStatus('idle');
      
      try {
        // 使用examType获取对应的试卷配置
        const examId = EXAM_TYPE_MAP[examType] || 'default';
        const data = await loadConfigurations(examId);
        setConfig(data);
        setSaveMessage(`已加载 ${EXAM_TYPE_OPTIONS.find(opt => opt.value === examType)?.label || examType} 配置`);
        setSaveStatus('success');
        setTimeout(() => {
          setSaveMessage('');
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('加载配置失败:', error);
        setSaveMessage(`加载 ${examType} 配置失败`);
        setSaveStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [examType]);

  // 保存配置
  const handleSave = async () => {
    if (!config) return;

    setSaveStatus('saving');
    setSaveMessage('正在保存...');

    try {
      // 保存时传递examType参数
      const examId = EXAM_TYPE_MAP[examType] || 'default';
      await saveConfigurations(config, examId);
      setSaveMessage(`${EXAM_TYPE_OPTIONS.find(opt => opt.value === examType)?.label || examType} 配置已保存`);
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
    // 导出时包含试卷类型
    const examId = EXAM_TYPE_MAP[examType] || 'default';
    exportConfigurations(config, examId);
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
          // 导入时指定当前试卷类型
          const examId = EXAM_TYPE_MAP[examType] || 'default';
          const data = await importConfigurations(file, examId);
          setConfig(data);
          setSaveMessage(`配置已导入到 ${EXAM_TYPE_OPTIONS.find(opt => opt.value === examType)?.label || examType}`);
          setSaveStatus('success');
          setTimeout(() => {
            setSaveMessage('');
            setSaveStatus('idle');
          }, 3000);
        } catch (error) {
          console.error('导入配置失败:', error);
          setSaveMessage('导入失败');
          setSaveStatus('error');
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
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>考试系统配置</h1>
          <div className={styles.typeSelector}>
            <label htmlFor="examType" className={styles.typeLabel}>试卷类型:</label>
            <select
              id="examType"
              className={styles.typeSelect}
              value={examType}
              onChange={handleTypeChange}
            >
              {EXAM_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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