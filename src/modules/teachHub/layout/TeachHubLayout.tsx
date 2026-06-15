'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import 'animal-island-ui/style';
import { Button, Card, Footer, Loading, Title } from 'animal-island-ui';
import { AuthGuard, AuthProvider, UserMenu, useAuthContext } from '@/lib/auth';
import { useTeachHubBootstrap } from '../hooks/useTeachHubBootstrap';
import { useTeachHubStore } from '../store/teachHubStore';
import { TEACH_HUB_BASE } from '../utils/routes';
import '../teach-hub.css';

const NAV_ITEMS = [
  { id: 'home', label: '我的工作区', href: TEACH_HUB_BASE },
  { id: 'new', label: '新建工作区', href: `${TEACH_HUB_BASE}/new` },
];

function resolveActiveId(pathname: string): string {
  if (pathname === `${TEACH_HUB_BASE}/new`) return 'new';
  return 'home';
}

function TeachHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const listLoading = useTeachHubStore((s) => s.listLoading);
  const activeId = useMemo(() => resolveActiveId(pathname), [pathname]);

  useTeachHubBootstrap(isAuthenticated);

  const isLessonView = pathname.includes('/lesson/') || pathname.includes('/reference/');

  return (
    <div className="th-root">
      {!isLessonView ? (
        <aside className="th-sidebar hidden lg:flex">
          <div className="th-sidebar__brand">
            <Title size="small" color="app-teal">
              Teach 学习工作区
            </Title>
          </div>
          <nav className="th-sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className="th-sidebar__link">
                <Button type={activeId === item.id ? 'primary' : 'text'} block>
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="th-sidebar__footer">
            <UserMenu />
          </div>
        </aside>
      ) : null}

      <div className="th-main">
        {!isLessonView ? (
          <header className="th-topbar lg:hidden">
            <Title size="small" color="app-green">
              Teach 学习工作区
            </Title>
            <UserMenu />
          </header>
        ) : null}

        <main className={isLessonView ? 'th-content th-content--wide' : 'th-content'}>
          {listLoading && isAuthenticated && pathname === TEACH_HUB_BASE ? (
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
