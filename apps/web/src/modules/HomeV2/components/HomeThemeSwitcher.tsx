'use client';

import { Button, useTheme } from '@sa2kit-ui/react';
import {
  HOME_V2_THEME_IDS,
  HOME_V2_THEME_LABELS,
  type HomeV2ThemeId,
} from './HomeV2ThemeProvider';

export function HomeThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="home-v2-theme-switch"
      role="group"
      aria-label="首页主题切换"
    >
      {HOME_V2_THEME_IDS.map((id) => (
        <Button
          key={id}
          type={theme === id ? 'primary' : 'default'}
          size="small"
          className="home-v2-theme-switch__btn"
          onClick={() => setTheme(id as HomeV2ThemeId)}
          aria-pressed={theme === id}
        >
          {HOME_V2_THEME_LABELS[id]}
        </Button>
      ))}
    </div>
  );
}
