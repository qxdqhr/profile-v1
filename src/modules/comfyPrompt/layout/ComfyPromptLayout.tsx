'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, Sparkles } from 'lucide-react';
import { AuthGuard, AuthProvider, UserMenu } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/testField/comfyPrompt/prompts', label: '提示词管理', icon: Sparkles },
  { href: '/testField/comfyPrompt/run', label: '远程运行', icon: Rocket },
] as const;

export function ComfyPromptLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      <AuthGuard requireAuth>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 text-slate-100">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-violet-400" size={22} />
                  <h1 className="text-xl font-semibold">ComfyUI 管理</h1>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  提示词资产沉淀与远程 ComfyUI 任务提交（v1 HTTP 轮询）
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/testField" className="text-sm text-slate-400 hover:text-white">
                  返回实验田
                </Link>
                <UserMenu />
              </div>
            </div>
            <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
