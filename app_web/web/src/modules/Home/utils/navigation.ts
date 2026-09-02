import type { NavItem } from '../types';

export function isExternalHref(href: string) {
  return (
    href.startsWith('//') ||
    href.startsWith('http://') ||
    href.startsWith('https://')
  );
}

export function resolveExternalHref(href: string) {
  if (href.startsWith('//')) {
    return `${window.location.protocol}${href}`;
  }
  return href;
}

export function navigateToItem(item: NavItem) {
  if (isExternalHref(item.href)) {
    window.open(resolveExternalHref(item.href), '_blank', 'noopener,noreferrer');
    return;
  }

  if (item.href.startsWith('#')) {
    const element = document.getElementById(item.id);
    element?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  window.location.href = item.href;
}
