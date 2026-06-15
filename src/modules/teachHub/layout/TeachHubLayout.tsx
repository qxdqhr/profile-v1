'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'animal-island-ui/style';
import { Card, Footer, Loading, Title } from 'animal-island-ui';
import { AuthGuard, AuthProvider, UserMenu, useAuthContext } from '@/lib/auth';
import { useTeachHubBootstrap } from '../hooks/useTeachHubBootstrap';
import { useTeachHubStore } from '../store/teachHubStore';
import { TEACH_HUB_BASE } from '../utils/routes';
import '../teach-hub.css';

function TeachHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const listLoading = useTeachHubStore((s) => s.listLoading);
  const isLessonView = pathname.includes('/lesson/') || pathname.includes('/reference/');
  const isHome = pathname === TEACH_HUB_BASE;

  useTeachHubBootstrap(isAuthenticated);

  return (
    <div className="th-root">
      <div className="th-main">
        {!isLessonView ? (
          <header className="th-topbar">
            <div className="flex min-w-0 items-center gap-3">
              <Link href={TEACH_HUB_BASE} className="shrink-0 no-underline">
                <Title size="small" color="app-teal">
                  Teach 学习工作区
                </Title>
              </Link>
              {!isHome ? (
                <Link href={TEACH_HUB_BASE} className="text-sm text-[#2c5282] hover:underline">
                  我的工作区
                </Link>
              ) : null}
            </div>
            <UserMenu />
          </header>
        ) : null}

        <main className={isLessonView ? 'th-content th-content--wide' : 'th-content'}>
          {listLoading && isAuthenticated && isHome ? (
            <div className="flex justify-center py-16">
              <Loading active />
            </div>
          ) : (
            children
          )}
        </main>

        {!isLessonView ? <Footer type="tree" /> : null}
      </div>
    </div>
  );
}

export function TeachHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard
        requireAuth
        fallback={
          <div className="th-auth-fallback">
            <Card pattern="app-teal" className="th-auth-card">
              <Title size="middle" color="app-teal">
                Teach 学习工作区
              </Title>
              <p className="th-auth-card__text">
                登录后即可创建个人 teach skill 工作区，管理 Mission、学习 HTML 课时并追踪进度。
              </p>
            </Card>
          </div>
        }
      >
        <TeachHubShell>{children}</TeachHubShell>
      </AuthGuard>
    </AuthProvider>
  );
}
