/**
 * 道具配置常量
 */

import type { Item } from '../types'

/** 预定义道具列表 */
export const ITEMS: Item[] = [
  // 食物类
  {
    id: 'apple',
    name: '苹果',
    type: 'food',
    icon: '🍎',
    description: '新鲜的红苹果',
    effectAnimation: 'eat',
    emotionChange: {
      happiness: 10,
      hunger: -20,
      energy: 5,
    },
    consumable: true,
    initialQuantity: 5,
  },
  {
    id: 'cake',
    name: '蛋糕',
    type: 'food',
    icon: '🍰',
    description: '美味的蛋糕',
    effectAnimation: 'happy',
    emotionChange: {
      happiness: 20,
      hunger: -30,
      energy: 10,
    },
    consumable: true,
    initialQuantity: 3,
  },
  {
    id: 'onion',
    name: '大葱',
    type: 'food',
    icon: '🧅',
    description: '初音的最爱！',
    effectAnimation: 'excited',
    emotionChange: {
      happiness: 30,
      hunger: -15,
      energy: 15,
    },
    consumable: true,
    initialQuantity: 10,
  },
  {
    id: 'milk',
    name: '牛奶',
    type: 'food',
    icon: '🥛',
    description: '营养丰富',
    effectAnimation: 'eat',
    emotionChange: {
      happiness: 8,
      hunger: -15,
      energy: 10,
    },
    consumable: true,
    initialQuantity: 5,
  },

  // 玩具类
  {
    id: 'ball',
    name: '球',
    type: 'toy',
    icon: '⚽',
    description: '可以一起玩的球',
    effectAnimation: 'play',
    emotionChange: {
      happiness: 15,
      energy: -10,
    },
    consumable: false,
    initialQuantity: 1,
  },
  {
    id: 'music_box',
    name: '音乐盒',
    type: 'toy',
    icon: '🎵',
    description: '播放美妙的音乐',
    effectAnimation: 'dance',
    emotionChange: {
      happiness: 20,
    },
    consumable: false,
    initialQuantity: 1,
  },
  {
    id: 'toy_bear',
    name: '玩具熊',
    type: 'toy',
    icon: '🧸',
    description: '可爱的玩具熊',
    effectAnimation: 'happy',
    emotionChange: {
      happiness: 12,
    },
    consumable: false,
    initialQuantity: 1,
  },

  // 礼物类
  {
    id: 'flower',
    name: '花束',
    type: 'gift',
    icon: '💐',
    description: '美丽的花束',
    effectAnimation: 'shy',
    emotionChange: {
      happiness: 25,
    },
    consumable: true,
    initialQuantity: 3,
  },
  {
    id: 'gift_box',
    name: '礼物盒',
    type: 'gift',
    icon: '🎁',
    description: '神秘的礼物',
    effectAnimation: 'surprised',
    emotionChange: {
      happiness: 30,
    },
    consumable: true,
    initialQuantity: 2,
  },
  {
    id: 'heart',
    name: '爱心',
    type: 'gift',
    icon: '❤️',
    description: '满满的爱意',
    effectAnimation: 'happy',
    emotionChange: {
      happiness: 20,
    },
    consumable: true,
    initialQuantity: 10,
  },

  // 装饰类
  {
    id: 'crown',
    name: '皇冠',
    type: 'decoration',
    icon: '👑',
    description: '闪亮的皇冠',
    effectAnimation: 'excited',
    emotionChange: {
      happiness: 15,
    },
    consumable: false,
    initialQuantity: 1,
  },
  {
    id: 'bow',
    name: '蝴蝶结',
    type: 'decoration',
    icon: '🎀',
    description: '可爱的蝴蝶结',
    effectAnimation: 'shy',
    emotionChange: {
      happiness: 10,
    },
    consumable: false,
    initialQuantity: 1,
  },
]

/** 根据道具ID获取道具配置 */
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id)
}

/** 根据道具类型获取道具列表 */
export function getItemsByType(type: Item['type']): Item[] {
  return ITEMS.filter(item => item.type === type)
}

/** 初始化道具库存 */
export function getInitialInventory(): Record<string, number> {
  const inventory: Record<string, number> = {}
  ITEMS.forEach(item => {
    if (item.initialQuantity && item.initialQuantity > 0) {
      inventory[item.id] = item.initialQuantity
    }
  })
  return inventory
}

