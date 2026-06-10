'use client';

/**
 * 多FX文件演示页面
 * 演示如何同时使用多个.fx和.x效果文件
 */

import React, { useState, useRef } from 'react';
import { MMDPlayerBase } from 'sa2kit/mmd';
import type { MMDPlayerBaseRef, MMDResources } from 'sa2kit/mmd';
import Link from 'next/link';

export default function MultiFXDemoPage() {
  const playerRef = useRef<MMDPlayerBaseRef>(null);
  const [presetId, setPresetId] = useState<string>('preset1');

  // 基础MMD资源
  const resources: MMDResources = {
    modelPath: '/models/miku/miku.pmx',
    motionPath: '/motions/dance.vmd',
    audioPath: '/audios/music.mp3',
  };

  // 预设1: 仅场景效果 (.x文件)
  const preset1 = {
    id: 'preset1',
    name: '场景级效果',
    description: '使用.x文件渲染整个环境',
    fxConfigs: [
      {
        path: '/effects/scene_base.x',
        type: 'x' as const,
        priority: -10,
        target: 'all' as const,
        description: '场景基础渲染'
      }
    ]
  };

  // 预设2: 场景 + 模型效果 (.x + .fx)
  const preset2 = {
    id: 'preset2',
    name: '场景 + 模型效果',
    description: '.x文件渲染环境 + .fx文件渲染模型',
    fxConfigs: [
      {
        path: '/effects/global_lighting.x',
        type: 'x' as const,
        priority: -10,
        target: 'all' as const,
        description: '全局光照'
      },
      {
        path: '/effects/PAToon/PAToon_モデル_標準.fx',
        texturePath: '/effects/PAToon/',
        type: 'fx' as const,
        priority: 0,
        target: 'model' as const,
        description: 'PAToon卡通效果'
      }
    ]
  };

  // 预设3: 多层次效果
  const preset3 = {
    id: 'preset3',
    name: '多层次效果',
    description: '场景基础 + 后期处理 + 模型效果 + 细节增强',
    fxConfigs: [
      {
        path: '/effects/environment.x',
        type: 'x' as const,
        priority: -10,
        target: 'all' as const,
        description: '环境渲染'
      },
      {
        path: '/effects/post_process.x',
        type: 'x' as const,
        priority: -5,
        target: 'scene' as const,
        description: '后期处理'
      },
      {
        path: '/effects/PAToon/PAToon_モデル_標準.fx',
        texturePath: '/effects/PAToon/',
        type: 'fx' as const,
        priority: 0,
        target: 'model' as const,
        description: 'PAToon效果'
      },
      {
        path: '/effects/rim_light.fx',
        type: 'fx' as const,
        priority: 10,
        target: 'model' as const,
        description: '边缘光'
      }
    ]
  };

  // 预设4: PAToon完整效果
  const preset4 = {
    id: 'preset4',
    name: 'PAToon完整效果',
    description: 'PAToon着色器 + 模型效果组合',
    fxConfigs: [
      {
        path: '/effects/PAToon/PAToon_シェーダー_標準.fx',
        texturePath: '/effects/PAToon/',
        type: 'fx' as const,
        priority: -5,
        target: 'all' as const,
        description: 'PAToon着色器基础'
      },
      {
        path: '/effects/PAToon/PAToon_モデル_標準.fx',
        texturePath: '/effects/PAToon/',
        type: 'fx' as const,
        priority: 0,
        target: 'model' as const,
        description: 'PAToon模型效果'
      }
    ]
  };

  const presets = [preset1, preset2, preset3, preset4];
  const currentPreset = presets.find(p => p.id === presetId) || preset1;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1600px',
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
            🌟 多FX文件演示
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            同时应用多个.fx和.x效果文件
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '2rem',
        }}>
          {/* 左侧：预设选择器 */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{ margin: '0 0 1.5rem', color: '#333' }}>
                选择预设
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPresetId(preset.id)}
                    style={{
                      padding: '1.5rem',
                      border: presetId === preset.id ? '2px solid #667eea' : '2px solid #e0e0e0',
                      background: presetId === preset.id ? '#f0f4ff' : 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 0.5rem',
                      color: presetId === preset.id ? '#667eea' : '#333',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}>
                      {preset.name}
                    </h3>
                    <p style={{
                      margin: '0 0 0.75rem',
                      color: '#666',
                      fontSize: '0.9rem',
                    }}>
                      {preset.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}>
                      {preset.fxConfigs.map((fx, idx) => {
                        const isX = fx.type === 'x';
                        return (
                          <span
                            key={idx}
                            style={{
                              padding: '0.25rem 0.6rem',
                              background: isX ? '#e8f5e9' : '#e3f2fd',
                              color: isX ? '#2e7d32' : '#1565c0',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {isX ? '🌍' : '🎨'} {fx.description || fx.path.split('/').pop()}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 当前配置信息 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ margin: '0 0 1rem', color: '#333', fontSize: '1rem' }}>
                当前配置
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>效果数量:</strong> {currentPreset.fxConfigs.length} 个
                </div>
                {currentPreset.fxConfigs.map((fx, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {idx + 1}. {fx.type === 'x' ? '🌍 场景级' : '🎨 模型级'}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <div>文件: {fx.path.split('/').pop()}</div>
                      <div>优先级: {fx.priority ?? 0}</div>
                      <div>目标: {fx.target}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：MMD播放器 */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '700px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000',
              }}>
                <MMDPlayerBase
                  key={presetId}
                  ref={playerRef}
                  resources={resources}
                  stage={{
                    backgroundColor: '#1a1a2e',
                    enablePhysics: true,
                    enableShadow: true,
                    fxConfigs: currentPreset.fxConfigs,
                  }}
                  renderEffect="outline"
                  outlineOptions={{
                    thickness: 0.003,
                    color: '#000000',
                  }}
                  autoPlay
                  loop
                  onLoad={() => console.log('MMD加载完成')}
                  onError={(error) => console.error('加载错误:', error)}
                />
              </div>
            </div>
          </div>
        </div>

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
            <h3 style={{ color: '#667eea' }}>文件类型说明</h3>
            <ul>
              <li><strong>🌍 .x文件（场景级）</strong>: 渲染整个环境，包括模型和舞台。优先级建议设置为负数（如-10），作为基础效果先应用。</li>
              <li><strong>🎨 .fx文件（模型级）</strong>: 应用到特定模型或部件。优先级建议设置为0或正数，作为细节效果后应用。</li>
            </ul>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>代码示例</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '6px',
              overflow: 'auto',
            }}>{`<MMDPlayerBase
  resources={{...}}
  stage={{
    // 🌟 使用多FX配置
    fxConfigs: [
      {
        path: '/effects/scene.x',      // 场景级
        type: 'x',
        priority: -10,
        target: 'all'
      },
      {
        path: '/effects/PAToon.fx',    // 模型级
        texturePath: '/effects/PAToon/',
        type: 'fx',
        priority: 0,
        target: 'model'
      },
      {
        path: '/effects/rim_light.fx', // 细节
        type: 'fx',
        priority: 10,
        target: 'model'
      }
    ]
  }}
/>`}</pre>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>优先级规则</h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '0.5rem',
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>优先级</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>类型</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>-10</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>.x</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>场景基础渲染</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>-5</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>.x</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>场景增强/后期处理</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>0</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>.fx</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>模型基础效果</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>5-10</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>.fx</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>细节增强效果</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>应用层级</h3>
            <div style={{
              background: '#f5f7fa',
              padding: '1.5rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}>
              <div>┌─────────────────────────────────┐</div>
              <div>│  .x 文件 (priority: -10)        │ ← 先应用</div>
              <div>│  场景基础渲染                    │</div>
              <div>└─────────────────────────────────┘</div>
              <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>↓</div>
              <div>┌─────────────────────────────────┐</div>
              <div>│  .x 文件 (priority: -5)         │</div>
              <div>│  后期处理效果                    │</div>
              <div>└─────────────────────────────────┘</div>
              <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>↓</div>
              <div>┌─────────────────────────────────┐</div>
              <div>│  .fx 文件 (priority: 0)         │</div>
              <div>│  模型卡通效果                    │</div>
              <div>└─────────────────────────────────┘</div>
              <div style={{ margin: '0.5rem 0', textAlign: 'center' }}>↓</div>
              <div>┌─────────────────────────────────┐</div>
              <div>│  .fx 文件 (priority: 10)        │ ← 后应用</div>
              <div>│  边缘光等细节                    │</div>
              <div>└─────────────────────────────────┘</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






