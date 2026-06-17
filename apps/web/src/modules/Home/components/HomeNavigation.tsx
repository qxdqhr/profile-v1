'use client';

import { Button, Card } from 'animal-island-ui';
import type { NavItem } from '../types';
import { isExternalHref, navigateToItem } from '../utils/navigation';

interface HomeNavigationProps {
  items: NavItem[];
  avatar: string;
  activeItemId: string;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (item: NavItem) => void;
}

export function HomeNavigation({
  items,
  avatar,
  activeItemId,
  isOpen,
  onToggle,
  onItemClick,
}: HomeNavigationProps) {
  const handleItemClick = (item: NavItem) => {
    navigateToItem(item);
    onItemClick(item);
    onToggle();
  };

  return (
    <>
      <Button
        type="default"
        className="home-nav-toggle"
        onClick={onToggle}
        aria-label={isOpen ? '关闭导航栏' : '打开导航栏'}
        aria-expanded={isOpen}
      >
        <span className={`home-nav-toggle__bar ${isOpen ? 'is-open' : ''}`} />
        <span className={`home-nav-toggle__bar ${isOpen ? 'is-open' : ''}`} />
        <span className={`home-nav-toggle__bar ${isOpen ? 'is-open' : ''}`} />
      </Button>

      {isOpen ? (
        <button
          type="button"
          className="home-nav-backdrop"
          aria-label="关闭导航遮罩"
          onClick={onToggle}
        />
      ) : null}

      <nav
        className={`home-nav-drawer ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <Card className="home-nav-drawer__card">
          <div className="home-nav-drawer__header">
            <span className="home-nav-drawer__logo">Profile</span>
          </div>

          <ul className="home-nav-drawer__list">
            {items.map((item) => {
              const isActive = activeItemId === item.id;
              return (
                <li key={item.id}>
                  <Button
                    type={isActive ? 'primary' : 'text'}
                    block
                    className="home-nav-drawer__item"
                    onClick={() => handleItemClick(item)}
                  >
                    <span>{item.label}</span>
                    {isExternalHref(item.href) ? (
                      <span className="home-nav-drawer__external" aria-hidden>
                        ↗
                      </span>
                    ) : null}
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="home-nav-drawer__avatar-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt="头像"
              className="home-nav-drawer__avatar"
            />
          </div>
        </Card>
      </nav>
    </>
  );
}
