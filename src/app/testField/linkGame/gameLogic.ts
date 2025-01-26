import { Tile, PathPoint, GRID_SIZE, TILE_SIZE, TYPES_COUNT, OUTER_PADDING } from './types'

export const initializeBoard = (): Tile[] => {
  const newTiles: Tile[] = []
  const types = []

  // 创建配对的图标类型
  for (let i = 0; i < (GRID_SIZE * GRID_SIZE) / 2; i++) {
    const type = Math.floor(Math.random() * TYPES_COUNT)
    types.push(type, type)
  }

  // 随机打乱
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]]
  }

  // 创建瓦片
  let typeIndex = 0
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      newTiles.push({
        id: y * GRID_SIZE + x,
        type: types[typeIndex++],
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        isSelected: false,
        isMatched: false
      })
    }
  }
  return newTiles
}

export const canConnect = (tile1: Tile, tile2: Tile, tiles: Tile[]): { canConnect: boolean, path: PathPoint[] } => {
  if (tile1.type !== tile2.type) return { canConnect: false, path: [] };

  // 获取网格坐标
  const x1 = Math.floor(tile1.x / TILE_SIZE);
  const y1 = Math.floor(tile1.y / TILE_SIZE);
  const x2 = Math.floor(tile2.x / TILE_SIZE);
  const y2 = Math.floor(tile2.y / TILE_SIZE);

  // 创建访问记录数组（包括外圈）
  const totalSize = GRID_SIZE + 2 * OUTER_PADDING;
  const visited = Array(totalSize).fill(0).map(() => Array(totalSize).fill(false));
  
  // 存储路径
  let currentPath: PathPoint[] = [];
  let bestPath: PathPoint[] = [];
  let minTurns = Infinity;
  let minLength = Infinity;

  const checkPath = (x: number, y: number, targetX: number, targetY: number, turns: number, path: PathPoint[]): boolean => {
    // 调整坐标到包含外圈的网格中
    const adjustedX = x + OUTER_PADDING;
    const adjustedY = y + OUTER_PADDING;

    if (adjustedX < 0 || adjustedX >= totalSize || adjustedY < 0 || adjustedY >= totalSize || visited[adjustedY][adjustedX]) {
      return false;
    }

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      const blockingTile = tiles.find(t => 
        Math.floor(t.x / TILE_SIZE) === x && 
        Math.floor(t.y / TILE_SIZE) === y && 
        !t.isMatched &&
        t.id !== tile1.id && 
        t.id !== tile2.id
      );
      if (blockingTile) return false;
    }

    const currentPoint = {
      x: (x + OUTER_PADDING) * TILE_SIZE + TILE_SIZE / 2,
      y: (y + OUTER_PADDING) * TILE_SIZE + TILE_SIZE / 2
    };
    path.push(currentPoint);

    if (x === targetX && y === targetY) {
      let pathLength = 0;
      for (let i = 1; i < path.length; i++) {
        pathLength += Math.abs(path[i].x - path[i-1].x) + Math.abs(path[i].y - path[i-1].y);
      }

      if (turns < minTurns || (turns === minTurns && pathLength < minLength)) {
        minTurns = turns;
        minLength = pathLength;
        bestPath = [...path];
      }
      path.pop();
      return true;
    }

    if (turns > 2) {
      path.pop();
      return false;
    }

    visited[adjustedY][adjustedX] = true;

    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ].map(dir => {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      const newDistance = Math.abs(targetX - newX) + Math.abs(targetY - newY);
      return { ...dir, distance: newDistance };
    }).sort((a, b) => a.distance - b.distance);

    let found = false;
    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      const needTurn = path.length > 1 && (
        (dir.dx !== 0 && Math.abs(path[path.length - 1].x - path[path.length - 2].x) < TILE_SIZE) ||
        (dir.dy !== 0 && Math.abs(path[path.length - 1].y - path[path.length - 2].y) < TILE_SIZE)
      );
      
      if (checkPath(newX, newY, targetX, targetY, needTurn ? turns + 1 : turns, path)) {
        found = true;
      }
    }

    visited[adjustedY][adjustedX] = false;
    path.pop();
    return found;
  };

  const found = checkPath(x1, y1, x2, y2, 0, currentPath);
  return {
    canConnect: found && bestPath.length > 0,
    path: bestPath
  };
} 