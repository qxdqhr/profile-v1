'use client';

/**
 * MMD + FX集成演示页面
 * 演示如何在MMD播放器中使用FX效果文件
 */

import React, { useState, useRef } from 'react';
import { MMDPlayerBase } from 'sa2kit/mmd';
import type { MMDPlayerBaseRef, MMDResources, MMDStage } from 'sa2kit/mmd';
import Link from 'next/link';

export default function MMDFXDemoPage() {
  const playerRef = useRef<MMDPlayerBaseRef>(null);
  const [currentFX, setCurrentFX] = useState<string>('none');
  const [loading, setLoading] = useState(false);

  // MMD资源配置（使用示例模型）
  const resources: MMDResources = {
    modelPath: '/models/miku/miku.pmx',
    motionPath: '/motions/dance.vmd',
    audioPath: '/audios/music.mp3',
  };

  // 基础舞台配置
  const baseStage: MMDStage = {
    backgroundColor: '#1a1a2e',
    enablePhysics: true,
    enableShadow: true,
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 0.8,
  };

  // FX效果选项
  const fxOptions = [
    {
      id: 'none',
      name: '无FX效果',
      description: '使用Three.js默认渲染',
      stage: baseStage,
    },
    {
      id: 'patoon-shader',
      name: 'PAToon Shader',
      description: 'PAToon着色器标准版',
      stage: {
        ...baseStage,
        fxPath: '/effects/PAToon_shader.fx',
        fxTexturePath: '/effects/PAToon/',
      },
    },
    {
      id: 'patoon-model',
      name: 'PAToon Model',
      description: 'PAToon模型标准版（含ModelToon）',
      stage: {
        ...baseStage,
        fxPath: '/effects/PAToon_model.fx',
        fxTexturePath: '/effects/PAToon/',
      },
    },
  ];

  const currentStage = fxOptions.find(opt => opt.id === currentFX)?.stage || baseStage;

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
            🎭 MMD + FX 效果集成
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            在MMD播放器中应用.fx效果文件
          </p>
        </header>

        {/* FX效果选择器 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ margin: '0 0 1.5rem', color: '#333' }}>
            选择FX效果
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}>
            {fxOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setLoading(true);
                  setCurrentFX(option.id);
                  setTimeout(() => setLoading(false), 500);
                }}
                style={{
                  padding: '1.5rem',
                  border: currentFX === option.id ? '2px solid #667eea' : '2px solid #e0e0e0',
                  background: currentFX === option.id ? '#f0f4ff' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <h3 style={{
                  margin: '0 0 0.5rem',
                  color: currentFX === option.id ? '#667eea' : '#333',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}>
                  {option.name}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#666',
                  fontSize: '0.9rem',
                }}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* MMD播放器 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '600px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#000',
          }}>
            {loading ? (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '1.2rem',
                zIndex: 10,
              }}>
                正在应用效果...
              </div>
            ) : null}

            <MMDPlayerBase
              key={currentFX} // 切换时重新加载
              ref={playerRef}
              resources={resources}
              stage={currentStage}
              renderEffect="outline"
              outlineOptions={{
                thickness: 0.003,
                color: '#000000',
              }}
              autoPlay
              loop
              onLoad={() => {
                console.log('MMD加载完成');
                setLoading(false);
              }}
              onError={(error) => {
                console.error('MMD加载错误:', error);
                setLoading(false);
              }}
            />
          </div>

          {/* 当前FX信息 */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f5f7fa',
            borderRadius: '8px',
          }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#333', fontSize: '1rem' }}>
              当前效果: {fxOptions.find(opt => opt.id === currentFX)?.name}
            </h3>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {currentFX === 'none' ? (
                <p style={{ margin: 0 }}>使用Three.js默认渲染，无特殊效果</p>
              ) : (
                <>
                  <p style={{ margin: '0 0 0.5rem' }}>
                    已应用FX文件配置：
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>材质参数自动应用</li>
                    <li>纹理自动加载</li>
                    <li>阴影系统配置</li>
                    <li>光照方向和强度</li>
                  </ul>
                </>
              )}
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
            <h3 style={{ color: '#667eea' }}>如何使用</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '6px',
              overflow: 'auto',
            }}>{`import { MMDPlayerBase } from 'sa2kit/mmd';

<MMDPlayerBase
  resources={{
    modelPath: '/models/miku.pmx',
    motionPath: '/motions/dance.vmd',
  }}
  stage={{
    // 🎨 应用FX效果
    fxPath: '/effects/PAToon_model.fx',
    fxTexturePath: '/effects/PAToon/',
  }}
  renderEffect="outline"
  autoPlay
  loop
/>`}</pre>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>支持的功能</h3>
            <ul>
              <li><strong>自动解析</strong>: 解析FX文件的所有参数和配置</li>
              <li><strong>材质应用</strong>: 颜色、发光、高光、光泽度</li>
              <li><strong>纹理加载</strong>: 自动加载FX引用的纹理</li>
              <li><strong>阴影配置</strong>: Shadow Map尺寸和质量</li>
              <li><strong>光照设置</strong>: 方向、强度、色调映射</li>
              <li><strong>描边效果</strong>: 与FX效果共存</li>
            </ul>

            <h3 style={{ color: '#667eea', marginTop: '1.5rem' }}>注意事项</h3>
            <ul>
              <li>FX文件需要符合MME格式</li>
              <li>纹理路径需要正确配置</li>
              <li>FX加载失败不影响基础渲染</li>
              <li>切换FX会重新加载播放器</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}






