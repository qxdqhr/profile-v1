import { Sprite } from '@pixi/react';
import { Coin as CoinType } from '../types';
import { TRACKS } from '../constants';

interface CoinProps {
    coin: CoinType;
}

const COIN_SIZE = 30;  // 金币大小

export const Coin = ({ coin }: CoinProps) => {
    if (coin.collected) return null;  // 如果已被收集则不渲染

    return (
        <Sprite
            image="/raceGame/images/coin.png"
            x={TRACKS[coin.track] - COIN_SIZE / 2}
            y={coin.y}
            width={COIN_SIZE}
            height={COIN_SIZE}
            anchor={0.5}
            alpha={1}
        />
    );
}; 