import { Tile, GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, TILE_GAP, TYPES_COUNT } from './types'

export const initializeBoard = (): Tile[] => {
  const tiles: Tile[] = []
  const types: number[] = []

  // 确保总格子数是偶数
  const totalTiles = GRID_WIDTH * GRID_HEIGHT
  if (totalTiles % 2 !== 0) {
    console.warn('Grid dimensions result in odd number of tiles')
  }

  // 生成配对的类型
  for (let i = 0; i < (GRID_WIDTH * GRID_HEIGHT) / 2; i++) {
    const type = i % TYPES_COUNT
    types.push(type, type)
  }

  // 随机打乱类型数组
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]]
  }

  // 创建图块
  let id = 0
  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      tiles.push({
        id: id++,
        type: types[row * GRID_WIDTH + col],
        x: col * (TILE_SIZE + TILE_GAP),
        y: row * (TILE_SIZE + TILE_GAP),
        isSelected: false,
        isMatched: false
      })
    }
  }

  return tiles
}

export const canConnect = (tile1: Tile, tile2: Tile, tiles: Tile[]): { canConnect: boolean, path: { x: number, y: number }[] } => {
  if (tile1.type !== tile2.type) {
    return { canConnect: false, path: [] }
  }

  // 创建网格表示图块占用情况，增加边界检查空间
  const BOUNDARY_SPACE = 4; // 增加边界空间
  const actualGridWidth = Math.max(...tiles.map(t => Math.floor(t.x / (TILE_SIZE + TILE_GAP)))) + 1;
  const actualGridHeight = Math.max(...tiles.map(t => Math.floor(t.y / (TILE_SIZE + TILE_GAP)))) + 1;
  const gridWidth = actualGridWidth + (BOUNDARY_SPACE * 2);
  const gridHeight = actualGridHeight + (BOUNDARY_SPACE * 2);
  const grid: boolean[][] = Array(gridHeight).fill(false).map(() => Array(gridWidth).fill(false));

  // 标记所有未匹配的图块位置，保留边界空间
  tiles.forEach(tile => {
    if (!tile.isMatched) {
      const gridX = Math.floor(tile.x / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE;
      const gridY = Math.floor(tile.y / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE;
      if (gridY < grid.length && gridX < grid[0].length) {
        grid[gridY][gridX] = true;
      }
    }
  });

  // 获取两个图块的网格坐标，考虑边界空间
  const start = {
    x: Math.floor(tile1.x / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE,
    y: Math.floor(tile1.y / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE
  };
  const end = {
    x: Math.floor(tile2.x / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE,
    y: Math.floor(tile2.y / (TILE_SIZE + TILE_GAP)) + BOUNDARY_SPACE
  };

  // 检查坐标是否在有效范围内
  if (start.y >= grid.length || start.x >= grid[0].length ||
        end.y >= grid.length || end.x >= grid[0].length) {
    return { canConnect: false, path: [] };
  }

  // 临时取消起点和终点的占用标记
  grid[start.y][start.x] = false;
  grid[end.y][end.x] = false;

  // 寻找路径
  const path = findPath(start, end, grid);

  // 恢复起点和终点的占用标记
  grid[start.y][start.x] = true;
  grid[end.y][end.x] = true;

  if (!path) {
    return { canConnect: false, path: [] };
  }

  // 转换路径坐标为实际坐标（考虑图块中心点），减去边界空间偏移
  const realPath = path.map(point => ({
    x: (point.x - BOUNDARY_SPACE) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
    y: (point.y - BOUNDARY_SPACE) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2
  }));

  return { canConnect: true, path: realPath };
}

// 辅助函数：检查是否可以直接连接
const canConnectDirectly = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): boolean => {
  if (start.x === end.x) {
    // 垂直连接
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    for (let y = minY + 1; y < maxY; y++) {
      if (grid[y][start.x]) {
        return false;
      }
    }
    return true;
  }
  if (start.y === end.y) {
    // 水平连接
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    for (let x = minX + 1; x < maxX; x++) {
      if (grid[start.y][x]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// 辅助函数：寻找一个转角的路径
const findOneCornerPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
  // 尝试通过水平-垂直路径连接
  const corner1 = { x: end.x, y: start.y };
  if (!grid[corner1.y][corner1.x] && canConnectDirectly(start, corner1, grid) && canConnectDirectly(corner1, end, grid)) {
    return [start, corner1, end];
  }

  // 尝试通过垂直-水平路径连接
  const corner2 = { x: start.x, y: end.y };
  if (!grid[corner2.y][corner2.x] && canConnectDirectly(start, corner2, grid) && canConnectDirectly(corner2, end, grid)) {
    return [start, corner2, end];
  }

  return null;
}

// 辅助函数：寻找两个转角的路径
const findTwoCornerPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
  // 扩大搜索范围，包括整个网格
  const gridWidth = grid[0].length;
  const gridHeight = grid.length;

  // 尝试水平方向的连接
  for (let x = 0; x < gridWidth; x++) {
    if (x === start.x || x === end.x) continue;
        
    const corner1 = { x, y: start.y };
    const corner2 = { x, y: end.y };

    if (!grid[corner1.y][corner1.x] && !grid[corner2.y][corner2.x] &&
            canConnectDirectly(start, corner1, grid) && 
            canConnectDirectly(corner1, corner2, grid) && 
            canConnectDirectly(corner2, end, grid)) {
      return [start, corner1, corner2, end];
    }
  }

  // 尝试垂直方向的连接
  for (let y = 0; y < gridHeight; y++) {
    if (y === start.y || y === end.y) continue;
        
    const corner1 = { x: start.x, y };
    const corner2 = { x: end.x, y };

    if (!grid[corner1.y][corner1.x] && !grid[corner2.y][corner2.x] &&
            canConnectDirectly(start, corner1, grid) && 
            canConnectDirectly(corner1, corner2, grid) && 
            canConnectDirectly(corner2, end, grid)) {
      return [start, corner1, corner2, end];
    }
  }

  return null;
}

// 主要的路径查找函数
const findPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
  // 检查直接连接
  if (canConnectDirectly(start, end, grid)) {
    return [start, end];
  }

  // 检查一个转角的路径
  const oneCornerPath = findOneCornerPath(start, end, grid);
  if (oneCornerPath) {
    return oneCornerPath;
  }

  // 检查两个转角的路径
  const twoCornerPath = findTwoCornerPath(start, end, grid);
  if (twoCornerPath) {
    return twoCornerPath;
  }

  return null;
}

// 检查是否存在可配对的方块
export const hasMatchablePairs = (tiles: Tile[]): boolean => {
  const unmatched = tiles.filter(tile => !tile.isMatched)
    
  for (let i = 0; i < unmatched.length; i++) {
    for (let j = i + 1; j < unmatched.length; j++) {
      const tile1 = unmatched[i]
      const tile2 = unmatched[j]
            
      if (tile1.type === tile2.type && canConnect(tile1, tile2, tiles).canConnect) {
        return true
      }
    }
  }
    
  return false
}

// 洗牌函数
export const shuffleTiles = (tiles: Tile[]): Tile[] => {
  // 获取未匹配的方块
  const matched = tiles.filter(tile => tile.isMatched)
  const unmatched = tiles.filter(tile => !tile.isMatched)
    
  // 只打乱未匹配方块的类型
  const types = unmatched.map(tile => tile.type)
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]]
  }
    
  // 重新分配类型
  const shuffled = unmatched.map((tile, index) => ({
    ...tile,
    type: types[index]
  }))
    
  // 合并已匹配和未匹配的方块
  return [...matched, ...shuffled].sort((a, b) => a.id - b.id)
} 