'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import 'animal-island-ui/style';
import { Footer, Loading, Title } from 'animal-island-ui';
import {
  AuthProvider,
  LoginRegisterModals,
  UserMenu,
  useAuthContext,
} from '@profile/auth/react';
import { TeachHubGuestLanding } from '../components/TeachHubGuestLanding';
import { useTeachHubBootstrap } from '../hooks/useTeachHubBootstrap';
import { useTeachHubStore } from '../store/teachHubStore';
import {
  thContentHome,
  thContentWide,
  thContentWorkspace,
  thMain,
  thRoot,
  thTopbar,
} from '../styles/tw';
import { isTeachHubHomePath, TEACH_HUB_HOME } from '../utils/routes';

function TeachHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const listLoading = useTeachHubStore((s) => s.listLoading);
  const isHome = isTeachHubHomePath(pathname);
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
            <Link href={TEACH_HUB_HOME} className="block no-underline">
              <Title size="small" color="app-teal">
                Teach 学习工作区
              </Title>
            </Link>
            <UserMenu />
          </header>
        ) : null}

        <main className={contentClass}>
          {listLoading && isHome ? (
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

function TeachHubLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const handleAuthSuccess = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(false);
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <TeachHubShell>{children}</TeachHubShell>
      ) : (
        <TeachHubGuestLanding onLogin={openLogin} onRegister={openRegister} />
      )}

      <LoginRegisterModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onCloseLogin={() => setLoginOpen(false)}
        onCloseRegister={() => setRegisterOpen(false)}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

export function TeachHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TeachHubLayoutInner>{children}</TeachHubLayoutInner>
    </AuthProvider>
  );
}
