/**
 * 小游戏导航模块类型
 */

export type GamePlatform = 'godot' | 'web';

export interface GameItem {
  id: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  platform: GamePlatform;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type GamePlatformFilter = 'all' | GamePlatform;
