'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import 'animal-island-ui/style';
import { Button, Card, Footer, Loading, Title } from 'animal-island-ui';
import { AuthGuard, AuthProvider, UserMenu, useAuth } from '@/auth/legacy';
import { useFitnessPlanBootstrap } from '../hooks/useFitnessPlanBootstrap';
import {
  FITNESS_MOBILE_NAV_ITEMS,
  FITNESS_NAV_ITEMS,
} from '../types';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';
import '../fitness-plan.css';

const MORE_LINKS = FITNESS_NAV_ITEMS.filter(
  (item) => !FITNESS_MOBILE_NAV_ITEMS.some((m) => m.id === item.id),
);

function resolveActiveNavId(pathname: string): string {
  if (pathname === '/testField/fitnessPlan') return 'today';
  if (pathname.startsWith('/testField/fitnessPlan/plans')) return 'plans';
  if (pathname.startsWith('/testField/fitnessPlan/schedule')) return 'schedule';
  if (pathname.startsWith('/testField/fitnessPlan/workout')) return 'workout';
  if (pathname.startsWith('/testField/fitnessPlan/diet')) return 'diet';
  if (pathname.startsWith('/testField/fitnessPlan/checkin')) return 'checkin';
  if (pathname.startsWith('/testField/fitnessPlan/stats')) return 'stats';
  if (pathname.startsWith('/testField/fitnessPlan/settings')) return 'settings';
  return 'today';
}

function FitnessPlanShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const profileLoading = useFitnessPlanStore((s) => s.profileLoading);
  const mobileMoreOpen = useFitnessPlanStore((s) => s.ui.mobileMoreOpen);
  const setMobileMoreOpen = useFitnessPlanStore((s) => s.setMobileMoreOpen);

  useFitnessPlanBootstrap(isAuthenticated);

  const activeId = useMemo(() => resolveActiveNavId(pathname), [pathname]);

  return (
    <div className="fp-root">
      <aside className="fp-sidebar hidden lg:flex">
        <div className="fp-sidebar__brand">
          <Title size="small" color="app-teal">
            健身计划
          </Title>
        </div>
        <nav className="fp-sidebar__nav">
          {FITNESS_NAV_ITEMS.map((item) => {
            const active = activeId === item.id;
            return (
              <Link key={item.id} href={item.href} className="fp-sidebar__link-wrap">
                <Button type={active ? 'primary' : 'text'} block className="fp-sidebar__link">
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="fp-sidebar__footer">
          <UserMenu />
        </div>
      </aside>

      <div className="fp-main">
        <header className="fp-topbar lg:hidden">
          <Title size="small" color="app-green">
            健身计划
          </Title>
          <UserMenu />
        </header>

        <main className="fp-content">
          {profileLoading && isAuthenticated ? (
            <div className="fp-loading-wrap">
              <Loading active />
            </div>
          ) : (
            children
          )}
        </main>

        <nav className="fp-mobile-nav lg:hidden" aria-label="健身模块导航">
          {FITNESS_MOBILE_NAV_ITEMS.map((item) => {
            const isMore = item.id === 'more';
            const active = isMore
              ? MORE_LINKS.some((link) => link.id === activeId)
              : activeId === item.id;

            if (isMore) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`fp-mobile-nav__item ${active ? 'is-active' : ''}`}
                  onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`fp-mobile-nav__item ${active ? 'is-active' : ''}`}
                onClick={() => setMobileMoreOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {mobileMoreOpen ? (
          <>
            <button
              type="button"
              className="fp-more-backdrop"
              aria-label="关闭更多菜单"
              onClick={() => setMobileMoreOpen(false)}
            />
            <Card className="fp-more-sheet" color="default">
              <p className="fp-more-sheet__title">更多功能</p>
              <div className="fp-more-sheet__links">
                {MORE_LINKS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="fp-more-sheet__link"
                    onClick={() => setMobileMoreOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </Card>
          </>
        ) : null}

        <Footer type="tree" />
      </div>
    </div>
  );
}

export function FitnessPlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard
        requireAuth
        fallback={
          <div className="fp-auth-fallback">
            <Card pattern="app-teal" className="fp-auth-card">
              <Title size="middle" color="app-teal">
                健身计划
              </Title>
              <p className="fp-auth-card__text">登录后即可管理训练计划、饮食与打卡记录。</p>
            </Card>
          </div>
        }
      >
        <FitnessPlanShell>{children}</FitnessPlanShell>
      </AuthGuard>
    </AuthProvider>
  );
}
