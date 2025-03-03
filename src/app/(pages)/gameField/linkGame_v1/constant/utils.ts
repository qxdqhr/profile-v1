import { GameType } from './types'

export const getGameTypeName = (type: GameType): string => {
    const typeMap: Record<GameType, string> = {
      disvariable: '不变化',
      downfalling: '向下掉落',
      upfalling: '向上移动',
      leftfalling: '向左移动',
      rightfalling: '向右移动',
      leftrightsplit: '左右分离',
      updownsplit: '上下分离',
      clockwise: '顺时针',
    counterclockwise: '逆时针'
  }
  return typeMap[type]
}
