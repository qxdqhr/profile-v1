'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'animal-island-ui/style';
import { Card, Footer, Loading, Title } from 'animal-island-ui';
import { AuthGuard, AuthProvider, UserMenu, useAuthContext } from '@profile/auth/react';
import { useTeachHubBootstrap } from '../hooks/useTeachHubBootstrap';
import { useTeachHubStore } from '../store/teachHubStore';
import {
  thAuthCardText,
  thAuthFallback,
  thContentHome,
  thContentWide,
  thContentWorkspace,
  thMain,
  thRoot,
  thTopbar,
} from '../styles/tw';
import { TEACH_HUB_BASE } from '../utils/routes';

function TeachHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const listLoading = useTeachHubStore((s) => s.listLoading);
  const isHome = pathname === TEACH_HUB_BASE;
  const isImmersive = pathname.includes('/lesson/') || pathname.includes('/reference/');

  useTeachHubBootstrap(isAuthenticated);

  const contentClass = isImmersive
    ? thContentWide
    : isHome
      ? thContentHome
      : thContentWorkspace;

  return (
    <div className={thRoot}>
      <div className={thMain}>
        {!isImmersive ? (
          <header className={thTopbar}>
            <Link href={TEACH_HUB_BASE} className="block no-underline">
              <Title size="small" color="app-teal">
                Teach 学习工作区
              </Title>
            </Link>
            <UserMenu />
          </header>
        ) : null}

        <main className={contentClass}>
          {listLoading && isAuthenticated && isHome ? (
            <div className="flex justify-center py-16">
              <Loading active />
            </div>
          ) : (
            children
          )}
        </main>

        {!isImmersive ? <Footer type="tree" /> : null}
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
          <div className={thAuthFallback}>
            <Card pattern="app-teal">
              <Title size="middle" color="app-teal">
                Teach 学习工作区
              </Title>
              <p className={thAuthCardText}>
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
