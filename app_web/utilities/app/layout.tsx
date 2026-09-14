import 'sa2kit/common/ui/style';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { UtilitiesThemeRoot } from './UtilitiesThemeRoot';

export const metadata: Metadata = {
  title: 'Profile 小工具',
  description: '二维码、日期计算、工时统计、图片下载等实用工具',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <UtilitiesThemeRoot>{children}</UtilitiesThemeRoot>
      </body>
    </html>
  );
}
