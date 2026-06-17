import { Sprite } from '@pixi/react';
import { Obstacle as ObstacleType } from '../types';
import { TRACKS } from '../constants';

interface ObstacleProps {
    obstacle: ObstacleType;
}

const OBSTACLE_SIZE = 50;

const getObstacleImage = (type: ObstacleType['type']) => {
  switch (type) {
  case 'rock':
    return '/raceGame/images/rock.png';
  case 'cone':
    return '/raceGame/images/cone.png';
  case 'barrier':
    return '/raceGame/images/barrier.png';
  }
};

export const Obstacle = ({ obstacle }: ObstacleProps) => {
  return (
    <Sprite
      image={getObstacleImage(obstacle.type)}
      x={TRACKS[obstacle.track]}
      y={obstacle.y}
      width={OBSTACLE_SIZE}
      height={OBSTACLE_SIZE}
      anchor={0.5}
    />
  );
}; 