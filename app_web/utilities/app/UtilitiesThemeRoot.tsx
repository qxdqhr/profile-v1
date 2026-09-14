'use client';

import { ThemeProvider } from 'sa2kit/common/ui';
import type { ReactNode } from 'react';

/** 小工具壳动森主题根（默认 animal-island） */
export function UtilitiesThemeRoot({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="animal-island">{children}</ThemeProvider>;
}
