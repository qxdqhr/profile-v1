import './globals.css';
import type { Metadata, Viewport } from 'next';
import { TeachHubLayout } from '@profile/teach-hub-core/layout/TeachHubLayout';

export const metadata: Metadata = {
  title: 'Profile Teach Hub',
  description: 'teachHub 学习工作区',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <TeachHubLayout>{children}</TeachHubLayout>
      </body>
    </html>
  );
}
