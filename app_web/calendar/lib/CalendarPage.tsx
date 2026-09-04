'use client';

/**
 * 宿主薄壳：AuthProvider + next/font。
 * UI 实现在 sa2kit/business/calendar/ui/web。
 */
import React from 'react';
import { AuthProvider } from '@profile/auth/react';
import { Nunito, Noto_Sans_SC } from 'next/font/google';
import {
  CalendarPage as CalendarApp,
  type CalendarPageProps,
} from 'sa2kit/business/calendar/ui/web';

export type { CalendarPageProps };

const calNunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cal-nunito',
});

const calNotoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-cal-noto',
});

export default function CalendarPage({
  toolsPanel,
  fontClassName,
}: CalendarPageProps = {}) {
  const fonts = `${calNunito.variable} ${calNotoSansSC.variable}${
    fontClassName ? ` ${fontClassName}` : ''
  }`;
  return (
    <AuthProvider>
      <CalendarApp toolsPanel={toolsPanel} fontClassName={fonts} />
    </AuthProvider>
  );
}
