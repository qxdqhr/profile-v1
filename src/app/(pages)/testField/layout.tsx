import { AuthProvider, UserMenu } from '@/modules/auth';

export const metadata = {
  title: '实验田 - Next.js',
  description: '功能测试和实验的地方',
}

export default function TestFieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50"> 
        {/* 主要内容 */}
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
