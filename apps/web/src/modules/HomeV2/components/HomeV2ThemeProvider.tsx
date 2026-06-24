'use client';

import {
  ThemeProvider,
  type Sa2ThemeId,
} from '@sa2kit-ui/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'profile-home-v2-theme';

export const HOME_V2_THEME_IDS = [
  'animal-island',
  'jieyuan-garden',
  'rhine-life',
  'endfield',
  'mizuki-roguelike',
  'sami-roguelike',
] as const;

export type HomeV2ThemeId = (typeof HOME_V2_THEME_IDS)[number];

export const HOME_V2_THEME_LABELS: Record<HomeV2ThemeId, string> = {
  'animal-island': '动森岛',
  'jieyuan-garden': '界园',
  'rhine-life': '莱茵生命',
  endfield: '终末地',
  'mizuki-roguelike': '水月肉鸽',
  'sami-roguelike': '萨米肉鸽',
};

export const HOME_V2_THEME_SWATCHES: Record<
  HomeV2ThemeId,
  { gradient: string; accent: string; description: string }
> = {
  'animal-island': {
    gradient: 'linear-gradient(135deg, #f8f8f0 0%, #d4f0e8 100%)',
    accent: '#19c8b9',
    description: '温馨圆润 · 动森手作感',
  },
  'jieyuan-garden': {
    gradient: 'linear-gradient(135deg, #e8d4da 0%, #b7d7c9 100%)',
    accent: '#e85a7a',
    description: '粉青园林 · 界园氛围',
  },
  'rhine-life': {
    gradient: 'linear-gradient(135deg, #f8fbfb 0%, #b8e8d4 100%)',
    accent: '#00b37a',
    description: '白绿实验室 · PRTS 终端',
  },
  endfield: {
    gradient: 'linear-gradient(135deg, #e8e8ec 0%, #2a2a30 100%)',
    accent: '#ffd000',
    description: '工业机能 · 明黄警示 HUD',
  },
  'mizuki-roguelike': {
    gradient: 'linear-gradient(135deg, #0c1830 0%, #3de8d0 50%, #9d7aff 100%)',
    accent: '#3de8d0',
    description: '阿戈尔深海 · 荧光星空肉鸽',
  },
  'sami-roguelike': {
    gradient: 'linear-gradient(135deg, #1a2838 0%, #7ec8e8 50%, #5a8ec8 100%)',
    accent: '#7ec8e8',
    description: '银凇冰原 · 密文板四色',
  },
};

const VALID_THEMES = new Set<string>(HOME_V2_THEME_IDS);

function readStoredTheme(): HomeV2ThemeId {
  if (typeof window === 'undefined') return 'animal-island';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && VALID_THEMES.has(saved)) {
    return saved as HomeV2ThemeId;
  }
  return 'animal-island';
}

export function HomeV2ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<HomeV2ThemeId>('animal-island');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(readStoredTheme());
    setReady(true);
  }, []);

  const handleThemeChange = useCallback((next: Sa2ThemeId) => {
    if (!VALID_THEMES.has(next)) return;
    setTheme(next as HomeV2ThemeId);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  if (!ready) {
    return (
      <ThemeProvider defaultTheme="animal-island">{children}</ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme} onThemeChange={handleThemeChange}>
      {children}
    </ThemeProvider>
  );
}
