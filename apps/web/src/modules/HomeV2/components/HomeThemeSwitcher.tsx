'use client';

import { Button, Modal, useTheme } from '@sa2kit-ui/react';
import { useState } from 'react';
import {
  HOME_V2_THEME_IDS,
  HOME_V2_THEME_LABELS,
  HOME_V2_THEME_SWATCHES,
  type HomeV2ThemeId,
} from './HomeV2ThemeProvider';

interface HomeThemeSwitcherProps {
  /** 紧凑模式：仅图标按钮，适合导航栏 */
  compact?: boolean;
}

export function HomeThemeSwitcher({ compact = false }: HomeThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: HomeV2ThemeId) => {
    setTheme(id);
    setOpen(false);
  };

  return (
    <>
      <Button
        type={compact ? 'default' : 'primary'}
        size="small"
        className={`home-v2-theme-trigger${compact ? ' home-v2-theme-trigger--compact' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {compact ? (
          <span className="home-v2-theme-trigger__icon" aria-hidden>
            ◈
          </span>
        ) : null}
        <span className="home-v2-theme-trigger__label">
          {compact ? '主题' : `主题 · ${HOME_V2_THEME_LABELS[theme]}`}
        </span>
      </Button>

      <Modal
        open={open}
        title="切换首页主题"
        width={480}
        maskClosable
        typewriter={false}
        onClose={() => setOpen(false)}
        footer={null}
        className="home-v2-theme-modal"
      >
        <p className="home-v2-theme-modal__hint">
          选择一套视觉风格，偏好会保存在本机浏览器中。
        </p>
        <div
          className="home-v2-theme-modal__grid"
          role="listbox"
          aria-label="可选主题"
        >
          {HOME_V2_THEME_IDS.map((id) => {
            const swatch = HOME_V2_THEME_SWATCHES[id];
            const isActive = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`home-v2-theme-card${isActive ? ' is-active' : ''}`}
                data-theme-preview={id}
                onClick={() => handleSelect(id)}
              >
                <span
                  className="home-v2-theme-card__swatch"
                  style={{
                    background: swatch.gradient,
                    borderColor: swatch.accent,
                  }}
                >
                  <span
                    className="home-v2-theme-card__dot"
                    style={{ background: swatch.accent }}
                  />
                </span>
                <span className="home-v2-theme-card__body">
                  <span className="home-v2-theme-card__name">
                    {HOME_V2_THEME_LABELS[id]}
                  </span>
                  <span className="home-v2-theme-card__desc">
                    {swatch.description}
                  </span>
                </span>
                {isActive ? (
                  <span className="home-v2-theme-card__check" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
