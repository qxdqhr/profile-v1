import { Container, Sprite } from '@pixi/react';
import { CarProps } from '../types';
import { useState, useEffect } from 'react';

const CAR_WIDTH = 40;  // 减小车的宽度
const CAR_HEIGHT = 60; // 减小车的高度

export const Car = ({ x, y }: CarProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Container position={[x, y]}>
      <Sprite
        image="/raceGame/images/car.png"
        width={CAR_WIDTH}
        height={CAR_HEIGHT}
        anchor={0.5}
      />
    </Container>
  );
}; 