export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface TimelineConfig {
  items: TimelineItem[];
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  text?: string;
  isDragging?: boolean;
}

export interface CollisionBallsConfig {
  balls: {
    id: string;
    label: string;
    color: string;
    size: number;
  }[];
  width: number;
  height: number;
} 