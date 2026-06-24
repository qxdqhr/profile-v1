'use client';

import { Button } from '@sa2kit-ui/react';
import { useEffect, useState } from 'react';
import type { NavItem } from '../../Home/types';
import { isExternalHref, navigateToItem } from '../../Home/utils/navigation';
import { HomeThemeSwitcher } from './HomeThemeSwitcher';

interface HomeNavigationV2Props {
  items: NavItem[];
  avatar: string;
  activeItemId: string;
  onItemClick: (item: NavItem) => void;
}

export function HomeNavigationV2({
  items,
  avatar,
  activeItemId,
  onItemClick,
}: HomeNavigationV2Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleItemClick = (item: NavItem) => {
    navigateToItem(item);
    onItemClick(item);
    setIsDrawerOpen(false);
  };

  const scrollToHome = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderLink = (item: NavItem, className: string) => {
    const isActive = activeItemId === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className={`${className} ${isActive ? 'is-active' : ''}`}
        onClick={() => handleItemClick(item)}
      >
        <span>{item.label}</span>
        {isExternalHref(item.href) ? (
          <span className="home-v2-nav__external" aria-hidden>
            ↗
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      <header className={`home-v2-nav ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="home-v2-nav__inner">
          <button
            type="button"
            className="home-v2-nav__brand"
            onClick={scrollToHome}
            aria-label="回到顶部"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt="" className="home-v2-nav__avatar" />
            <span className="home-v2-nav__logo">Profile</span>
          </button>

          <ul className="home-v2-nav__links" aria-label="主导航">
            {items.map((item) => renderLink(item, 'home-v2-nav__link'))}
          </ul>

          <HomeThemeSwitcher compact />

          <Button
            type="default"
            className="home-v2-nav__menu-btn"
            onClick={() => setIsDrawerOpen((open) => !open)}
            aria-label={isDrawerOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isDrawerOpen}
          >
            <span
              className={`home-v2-nav__menu-icon ${isDrawerOpen ? 'is-open' : ''}`}
            />
            <span
              className={`home-v2-nav__menu-icon ${isDrawerOpen ? 'is-open' : ''}`}
            />
            <span
              className={`home-v2-nav__menu-icon ${isDrawerOpen ? 'is-open' : ''}`}
            />
          </Button>
        </div>
      </header>

      {isDrawerOpen ? (
        <button
          type="button"
          className="home-v2-nav__overlay"
          aria-label="关闭菜单遮罩"
          onClick={() => setIsDrawerOpen(false)}
        />
      ) : null}

      <nav
        className={`home-v2-nav__drawer ${isDrawerOpen ? 'is-open' : ''}`}
        aria-hidden={!isDrawerOpen}
        aria-label="移动端导航"
      >
        <ul className="home-v2-nav__drawer-list">
          {items.map((item) => (
            <li key={item.id}>
              {renderLink(item, 'home-v2-nav__link')}
            </li>
          ))}
        </ul>
        <div className="home-v2-nav__drawer-theme">
          <HomeThemeSwitcher />
        </div>
      </nav>
    </>
  );
}
