'use client';

import {
  ThemeProvider,
  type Sa2ThemeId,
} from '@sa2kit-ui/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'profile-home-v2-theme';

export const HOME_V2_THEME_IDS = ['animal-island', 'jieyuan-garden', 'rhine-life'] as const;
export type HomeV2ThemeId = (typeof HOME_V2_THEME_IDS)[number];

export const HOME_V2_THEME_LABELS: Record<HomeV2ThemeId, string> = {
  'animal-island': '动森岛',
  'jieyuan-garden': '界园',
  'rhine-life': '莱茵生命',
};

function readStoredTheme(): HomeV2ThemeId {
  if (typeof window === 'undefined') return 'animal-island';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (
    saved === 'jieyuan-garden' ||
    saved === 'animal-island' ||
    saved === 'rhine-life'
  ) {
    return saved;
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
    if (next !== 'animal-island' && next !== 'jieyuan-garden' && next !== 'rhine-life') return;
    setTheme(next);
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
