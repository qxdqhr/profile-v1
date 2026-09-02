'use client';

import { ThemeProvider } from 'sa2kit/common/ui';
import type { ReactNode } from 'react';

/** ShowMasterpiece 动森主题根（默认 animal-island） */
export function ShowMasterpieceThemeRoot({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="animal-island">{children}</ThemeProvider>;
}
