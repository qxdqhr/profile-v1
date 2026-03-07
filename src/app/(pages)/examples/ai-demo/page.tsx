'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';

const FeatureUnavailable = ({ featureName }: { featureName: string }) => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
    <p className="font-semibold">{featureName} 暂不可用</p>
    <p className="mt-1 text-sm">
      当前安装的 sa2kit 版本未包含该功能模块。请升级到包含 AI 浏览器端能力的版本后再试。
    </p>
  </div>
);

const OCRScanner = dynamic(
  () =>
    Promise.resolve({
      default: (props: { className?: string; [key: string]: unknown }) => (
        <div className={props.className}>
          <FeatureUnavailable featureName="OCR 文字识别" />
        </div>
      ),
    }),
  { ssr: false }
);
const BackgroundRemover = dynamic(
  () =>
    Promise.resolve({
      default: (props: { className?: string; [key: string]: unknown }) => (
        <div className={props.className}>
          <FeatureUnavailable featureName="图片背景移除" />
        </div>
      ),
    }),
  { ssr: false }
);
const SentimentAnalyzer = dynamic(
  () =>
    Promise.resolve({
      default: (props: { className?: string; [key: string]: unknown }) => (
        <div className={props.className}>
          <FeatureUnavailable featureName="文本情感分析" />
        </div>
      ),
    }),
  { ssr: false }
);
const SmartAssistant = dynamic(
  () =>
    Promise.resolve({
      default: (props: { className?: string; [key: string]: unknown }) => (
        <div className={props.className}>
          <FeatureUnavailable featureName="智能对话助手" />
        </div>
      ),
    }),
  { ssr: false }
);

import { 
  Languages, 
  Clipboard, 
  Check, 
  RotateCcw, 
  FileText, 
  Eraser, 
  MessageSquare,
  Cpu,
  Sparkles
} from 'lucide-react';

type AIFeature = 'ocr' | 'background-removal' | 'sentiment-analysis' | 'smart-assistant';

export default function AIDemoPage() {
  const [activeFeature, setActiveFeature] = useState<AIFeature>('ocr');
  const [ocrResult, setOcrResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('eng');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ocrResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { id: 'ocr', name: 'OCR 文字识别', icon: FileText, color: 'text-blue-600' },
    { id: 'background-removal', name: '背景移除', icon: Eraser, color: 'text-purple-600' },
    { id: 'sentiment-analysis', name: '情感分析', icon: MessageSquare, color: 'text-green-600' },
    { id: 'smart-assistant', name: '智能对话助手', icon: Sparkles, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            <Cpu size={14} />
            Local-first AI
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            浏览器端 AI 功能演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            所有功能均在本地运行，无需上传数据到服务器。基于 WASM 和最新前端 AI 模型。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1 space-y-2">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id as AIFeature)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                  activeFeature === feature.id
                    ? 'bg-white dark:bg-gray-800 shadow-md transform scale-105 z-10'
                    : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'
                )}
              >
                <div className={clsx(
                  'p-2 rounded-lg',
                  activeFeature === feature.id
                    ? 'bg-amber-50 dark:bg-amber-900/20 ' + feature.color
                    : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <feature.icon size={20} />
                </div>
                <span>{feature.name}</span>
              </button>
            ))}
          </div>

          {/* 右侧主区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-8 flex-1">
                {activeFeature === 'ocr' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        OCR 文字识别
                      </h2>
                      <div className="flex items-center gap-2">
                        <Languages size={18} className="text-gray-400" />
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="eng">English</option>
                          <option value="chi_sim">简体中文</option>
                          <option value="chi_tra">繁体中文</option>
                          <option value="jpn">日本語</option>
                        </select>
                      </div>
                    </div>
                    
                    <OCRScanner 
                      language={language}
                      onResult={(text: string) => setOcrResult(text)}
                      className="bg-gray-50 dark:bg-gray-900/30"
                    />

                    {ocrResult && (
                      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 dark:text-white">识别结果</h3>
                          <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                          >
                            {copied ? (
                              <><Check size={14} className="text-green-500" /><span>已复制</span></>
                            ) : (
                              <><Clipboard size={14} /><span>复制文本</span></>
                            )}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed font-sans text-sm">
                          {ocrResult}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {activeFeature === 'background-removal' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Eraser className="text-purple-600" />
                      图片背景移除
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      基于机器学习模型自动识别前景并去除背景，生成透明 PNG 图片。
                    </p>
                    <BackgroundRemover className="bg-gray-50 dark:bg-gray-900/30" />
                  </div>
                )}

                {activeFeature === 'sentiment-analysis' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="text-green-600" />
                      文本情感分析
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      分析文本中的情感倾向（积极、消极或中性）。已升级多语言模型，支持中文和英文。
                    </p>
                    <SentimentAnalyzer className="bg-gray-50 dark:bg-gray-900/30 border-none shadow-none p-0" />
                  </div>
                )}

                {activeFeature === 'smart-assistant' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-amber-500" />
                        智能对话助手
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        联动情感分析与文本生成模型。AI 会感知你的情绪并给出贴心的本地回复。
                      </p>
                    </div>
                    <SmartAssistant className="flex-1" />
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                <span>模型运行在浏览器端，首次运行可能需要下载资源</span>
                <span className="font-mono">sa2kit/ai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="/examples/"
            className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all font-medium"
          >
            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
            <span>返回示例列表</span>
          </a>
        </div>
      </div>
    </div>
  );
}







