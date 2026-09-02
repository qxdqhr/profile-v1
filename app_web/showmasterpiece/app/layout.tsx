import './globals.css';
import './sa2kit-ui.css';
import type { Metadata, Viewport } from 'next';
import { ShowMasterpieceThemeRoot } from './ShowMasterpieceThemeRoot';

export const metadata: Metadata = {
  title: '葱韵环京魔法屋',
  description: '探索精美的艺术作品，感受创作的魅力',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ShowMasterpieceThemeRoot>{children}</ShowMasterpieceThemeRoot>
      </body>
    </html>
  );
}
