/**
 * 交互区域工具函数
 */

import type { InteractionZone, BodyPart } from '../types'

/** 预定义的交互区域 */
export const INTERACTION_ZONES: InteractionZone[] = [
  {
    id: 'head',
    label: '头部',
    bounds: {
      x: 50,
      y: 20,
      width: 20,
      height: 15,
    },
  },
  {
    id: 'face',
    label: '脸部',
    bounds: {
      x: 50,
      y: 28,
      width: 18,
      height: 12,
    },
  },
  {
    id: 'body',
    label: '身体',
    bounds: {
      x: 50,
      y: 50,
      width: 25,
      height: 20,
    },
  },
  {
    id: 'leftArm',
    label: '左手',
    bounds: {
      x: 35,
      y: 50,
      width: 12,
      height: 20,
    },
  },
  {
    id: 'rightArm',
    label: '右手',
    bounds: {
      x: 65,
      y: 50,
      width: 12,
      height: 20,
    },
  },
  {
    id: 'leftLeg',
    label: '左腿',
    bounds: {
      x: 43,
      y: 75,
      width: 10,
      height: 20,
    },
  },
  {
    id: 'rightLeg',
    label: '右腿',
    bounds: {
      x: 57,
      y: 75,
      width: 10,
      height: 20,
    },
  },
]

/**
 * 检测点击位置对应的身体部位
 */
export function detectBodyPart(x: number, y: number): BodyPart {
  for (const zone of INTERACTION_ZONES) {
    const halfWidth = zone.bounds.width / 2
    const halfHeight = zone.bounds.height / 2

    if (
      x >= zone.bounds.x - halfWidth &&
      x <= zone.bounds.x + halfWidth &&
      y >= zone.bounds.y - halfHeight &&
      y <= zone.bounds.y + halfHeight
    ) {
      return zone.id
    }
  }

  return 'none'
}

/**
 * 获取身体部位的中心坐标
 */
export function getBodyPartCenter(bodyPart: BodyPart): { x: number; y: number } | null {
  const zone = INTERACTION_ZONES.find(z => z.id === bodyPart)
  if (!zone) return null

  return {
    x: zone.bounds.x,
    y: zone.bounds.y,
  }
}

/**
 * 检查两个身体部位是否相邻
 */
export function areBodyPartsAdjacent(part1: BodyPart, part2: BodyPart): boolean {
  const adjacencyMap: Record<BodyPart, BodyPart[]> = {
    head: ['face'],
    face: ['head', 'body'],
    body: ['face', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
    leftArm: ['body'],
    rightArm: ['body'],
    leftLeg: ['body'],
    rightLeg: ['body'],
    none: [],
  }

  return adjacencyMap[part1]?.includes(part2) || false
}

