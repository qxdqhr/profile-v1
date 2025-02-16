import { Sprite } from '@pixi/react';
import { Coin as CoinType } from '../types';
import { TRACKS } from '../constants';

interface CoinProps {
    coin: CoinType;
}

const COIN_SIZE = 35;  // 调整金币尺寸

export const Coin = ({ coin }: CoinProps) => {
  if (coin.collected) return null;  // 如果已被收集则不渲染

  return (
    <Sprite
      image="/raceGame/images/coin.png"
      x={TRACKS[coin.track]}  // 移除偏移量，直接使用轨道中心位置
      y={coin.y}
      width={COIN_SIZE}
      height={COIN_SIZE}
      anchor={0.5}  // 使用锚点确保居中
      alpha={1}
    />
  );
}; 