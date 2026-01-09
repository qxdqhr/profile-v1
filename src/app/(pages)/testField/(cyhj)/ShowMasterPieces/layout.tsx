export const metadata = {
  title: '葱韵环京魔法屋',
  description: '探索精美的艺术作品，感受创作的魅力',
}

// 添加专门的viewport导出
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function ShowMasterPiecesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
