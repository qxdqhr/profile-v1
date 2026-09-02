import type { GameItem, GamePlatformFilter } from '../types';

export function filterGames(
  items: GameItem[],
  searchQuery: string,
  platform: GamePlatformFilter,
): GameItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesPlatform = platform === 'all' || item.platform === platform;
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesPlatform && matchesSearch;
  });
}

export function sortGames(items: GameItem[]): GameItem[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
}

export function getGameCounts(items: GameItem[]) {
  return {
    all: items.length,
    godot: items.filter((g) => g.platform === 'godot').length,
    web: items.filter((g) => g.platform === 'web').length,
    completed: items.filter((g) => g.isCompleted).length,
  };
}
