'use client';

import { useEffect, useMemo, useState } from 'react';
import type { NavItem } from '../types';

export function useScrollSpy(
  items: NavItem[],
  options?: { enabled?: boolean; initialActiveId?: string },
) {
  const [activeId, setActiveId] = useState(options?.initialActiveId ?? '');
  const [isUserClicking, setIsUserClicking] = useState(false);

  const anchorItems = useMemo(
    () => items.filter((item) => item.href.startsWith('#')),
    [items],
  );

  useEffect(() => {
    if (!options?.enabled || anchorItems.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      let currentActiveId = '';

      for (const item of anchorItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          currentActiveId = item.id;
          break;
        }
      }

      if (!currentActiveId && scrollPosition < 200) {
        currentActiveId = anchorItems[0]?.id ?? '';
      }

      if (currentActiveId && !isUserClicking) {
        setActiveId((prev) => (prev === currentActiveId ? prev : currentActiveId));
      }
    };

    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
    const throttledHandleScroll = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        handleScroll();
        throttleTimeout = null;
      }, 50);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [anchorItems, isUserClicking, options?.enabled]);

  useEffect(() => {
    if (options?.initialActiveId) {
      setActiveId(options.initialActiveId);
    }
  }, [options?.initialActiveId]);

  const selectItem = (id: string) => {
    setIsUserClicking(true);
    setActiveId(id);
    setTimeout(() => setIsUserClicking(false), 1500);
  };

  return { activeId, setActiveId: selectItem };
}
