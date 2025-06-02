import React from 'react';
import { Settings } from 'lucide-react';
import { WatermarkConfig } from './ImageUpload';
import styles from './WatermarkConfig.module.css';

interface WatermarkConfigProps {
  config: WatermarkConfig;
  onChange: (config: WatermarkConfig) => void;
  className?: string;
}

export const WatermarkConfigComponent: React.FC<WatermarkConfigProps> = ({
  config,
  onChange,
  className
}) => {
  const handleChange = (field: keyof WatermarkConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <Settings size={16} />
        <span>水印设置</span>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className={styles.checkbox}
          />
          启用水印
        </label>
      </div>

      {config.enabled && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>水印类型</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  checked={!config.imageUrl}
                  onChange={() => handleChange('imageUrl', '')}
                  className={styles.radio}
                />
                文字水印
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  checked={!!config.imageUrl}
                  onChange={() => handleChange('imageUrl', 'placeholder')}
                  className={styles.radio}
                />
                图片水印
              </label>
            </div>
          </div>

          {!config.imageUrl ? (
            <>
              <div className={styles.field}>
                <label className={styles.label}>水印文字</label>
                <input
                  type="text"
                  value={config.text || ''}
                  onChange={(e) => handleChange('text', e.target.value)}
                  placeholder="输入水印文字"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>文字颜色</label>
                <input
                  type="color"
                  value={config.color || '#ffffff'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className={styles.colorInput}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>字体大小</label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={config.fontSize || 16}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className={styles.range}
                />
                <span className={styles.rangeValue}>{config.fontSize || 16}px</span>
              </div>
            </>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>水印图片URL</label>
              <input
                type="url"
                value={config.imageUrl === 'placeholder' ? '' : (config.imageUrl || '')}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="输入水印图片的URL"
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>位置</label>
            <select
              value={config.position || 'bottom-right'}
              onChange={(e) => handleChange('position', e.target.value)}
              className={styles.select}
            >
              <option value="top-left">左上角</option>
              <option value="top-right">右上角</option>
              <option value="bottom-left">左下角</option>
              <option value="bottom-right">右下角</option>
              <option value="center">居中</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>透明度</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.opacity || 0.5}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              className={styles.range}
            />
            <span className={styles.rangeValue}>{Math.round((config.opacity || 0.5) * 100)}%</span>
          </div>
        </>
      )}
    </div>
  );
}; 