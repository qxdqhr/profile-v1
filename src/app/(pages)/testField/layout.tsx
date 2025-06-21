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
        {/* 顶部导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">实验田</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </nav>
        
        {/* 主要内容 */}
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
