import { AuthProvider, UserMenu } from '@/modules/auth';

export const metadata = {
  title: '实验田 - Next.js',
  description: '功能测试和实验的地方',
}

// 添加专门的viewport导出
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function TestFieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
        {/* 主要内容 */}
        {/* <main> */}
          {children}
        {/* </main> */}
    </AuthProvider>
  )
}
