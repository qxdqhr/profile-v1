'use client';

/**
 * FX解析器演示页面
 * 演示如何使用FX解析器解析PAToon等MME效果文件
 */

import React, { useState } from 'react';
import { FXParser, FXViewer, exportFXToMarkdown, exportFXToJSON } from 'sa2kit/mmd';
import type { FXEffect } from 'sa2kit/mmd';
import Link from 'next/link';
import './FXViewer.css';

export default function FXParserDemoPage() {
  const [fxContent, setFxContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedEffect, setParsedEffect] = useState<FXEffect | null>(null);
  const [mode, setMode] = useState<'file' | 'text'>('file');

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFxContent(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  // 下载解析结果
  const downloadJSON = () => {
    if (!parsedEffect) return;
    const json = exportFXToJSON(parsedEffect);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (parsedEffect.fileName) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    if (!parsedEffect) return;
    const md = exportFXToMarkdown(parsedEffect);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (parsedEffect.fileName) + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 示例FX文件
  const loadExample = async (exampleName: string) => {
    try {
      const response = await fetch('/examples/' + (exampleName));
      const content = await response.text();
      setFxContent(content);
      setFileName(exampleName);
    } catch (error) {
      console.error('加载示例失败:', error);
      alert('加载示例失败，请确保文件存在');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* 后退按钮 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/examples/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ← 返回首页
          </Link>
        </div>

        <header style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '2rem',
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🎨 FX文件解析器
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            解析和分析MME (MikuMikuEffect) 的.fx效果文件
          </p>
        </header>

        {/* 输入区域 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setMode('file')}
              style={{
                padding: '0.75rem 1.5rem',
                border: mode === 'file' ? '2px solid #667eea' : '2px solid #e0e0e0',
                background: mode === 'file' ? '#f0f4ff' : 'white',
                color: mode === 'file' ? '#667eea' : '#666',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              📁 上传文件
            </button>
            <button
              onClick={() => setMode('text')}
              style={{
                padding: '0.75rem 1.5rem',
                border: mode === 'text' ? '2px solid #667eea' : '2px solid #e0e0e0',
                background: mode === 'text' ? '#f0f4ff' : 'white',
                color: mode === 'text' ? '#667eea' : '#666',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              ✏️ 粘贴代码
            </button>
          </div>

          {mode === 'file' ? (
            <div>
              <div style={{
                border: '2px dashed #667eea',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                background: '#f0f4ff',
                marginBottom: '1rem',
              }}>
                <input
                  type="file"
                  accept=".fx"
                  onChange={handleFileChange}
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    padding: '0.5rem',
                  }}
                />
                <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  支持 .fx 文件格式
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ color: '#666', lineHeight: '2.5' }}>快速示例：</span>
                <button
                  onClick={() => loadExample('PAToon_shader.fx')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  PAToon Shader
                </button>
                <button
                  onClick={() => loadExample('PAToon_model.fx')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  PAToon Model
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="文件名 (例如: effect.fx)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                }}
              />
              <textarea
                placeholder="在此粘贴FX文件内容..."
                value={fxContent}
                onChange={(e) => setFxContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontFamily: 'Monaco, Menlo, Consolas, monospace',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
            </div>
          )}
        </div>

        {/* 解析结果 */}
        {fxContent && (
          <>
            <FXViewer
              source={fxContent}
              isContent={true}
              fileName={fileName || 'unknown.fx'}
              onParsed={setParsedEffect}
              onError={(error) => console.error('解析错误:', error)}
            />

            {/* 导出按钮 */}
            {parsedEffect && (
              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
              }}>
                <button
                  onClick={downloadJSON}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginRight: '1rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  📥 导出JSON
                </button>
                <button
                  onClick={downloadMarkdown}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.4)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(118, 75, 162, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(118, 75, 162, 0.4)';
                  }}
                >
                  📄 导出Markdown
                </button>
              </div>
            )}
          </>
        )}

        {/* 使用说明 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>📚 使用说明</h2>
          <div style={{ color: '#666', lineHeight: 1.8 }}>
            <h3 style={{ color: '#667eea' }}>基础用法</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '6px',
              overflow: 'auto',
            }}>{`import { FXParser } from 'sa2kit/mmd/fx';

// 方法1: 从URL加载
const parser = new FXParser();
const effect = await parser.loadAndParse('/effects/PAToon.fx');

// 方法2: 解析文本内容
const content = '/* FX file content */';
const effect = parser.parse(content, 'effect.fx');

// 访问解析结果
console.log('宏定义:', effect.defines);
console.log('纹理:', effect.textures);
console.log('参数:', effect.parameters);
console.log('控制器:', effect.controllers);`}</pre>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>React组件</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '6px',
              overflow: 'auto',
            }}>{`import { FXViewer } from 'sa2kit/mmd/fx';

<FXViewer
  source="/effects/PAToon.fx"
  onParsed={(effect) => console.log(effect)}
  onError={(error) => console.error(error)}
/>`}</pre>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>解析的内容</h3>
            <ul>
              <li><strong>宏定义 (Defines)</strong>: 所有 #define 指令，包括启用/禁用状态</li>
              <li><strong>纹理 (Textures)</strong>: 纹理路径、尺寸和用途</li>
              <li><strong>参数 (Parameters)</strong>: float, float3, float4 等变量声明</li>
              <li><strong>控制器 (Controllers)</strong>: CONTROLOBJECT 引用</li>
              <li><strong>静态变量</strong>: static 变量定义</li>
              <li><strong>Techniques 和 Passes</strong>: 渲染技术定义</li>
              <li><strong>着色器函数</strong>: 顶点和像素着色器函数</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
