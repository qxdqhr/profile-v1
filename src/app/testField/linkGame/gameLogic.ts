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

    // 创建网格表示图块占用情况
    const grid: boolean[][] = Array(GRID_HEIGHT + 2).fill(false).map(() => Array(GRID_WIDTH + 2).fill(false))

    // 标记所有未匹配的图块位置
    tiles.forEach(tile => {
        if (!tile.isMatched) {
            const gridX = Math.floor(tile.x / (TILE_SIZE + TILE_GAP)) + 1
            const gridY = Math.floor(tile.y / (TILE_SIZE + TILE_GAP)) + 1
            grid[gridY][gridX] = true
        }
    })

    // 获取两个图块的网格坐标
    const start = {
        x: Math.floor(tile1.x / (TILE_SIZE + TILE_GAP)) + 1,
        y: Math.floor(tile1.y / (TILE_SIZE + TILE_GAP)) + 1
    }
    const end = {
        x: Math.floor(tile2.x / (TILE_SIZE + TILE_GAP)) + 1,
        y: Math.floor(tile2.y / (TILE_SIZE + TILE_GAP)) + 1
    }

    // 临时取消起点和终点的占用标记
    grid[start.y][start.x] = false
    grid[end.y][end.x] = false

    // 寻找路径
    const path = findPath(start, end, grid)

    // 恢复起点和终点的占用标记
    grid[start.y][start.x] = true
    grid[end.y][end.x] = true

    if (!path) {
        return { canConnect: false, path: [] }
    }

    // 转换路径坐标为实际坐标（考虑图块中心点）
    const realPath = path.map(point => ({
        x: (point.x - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
        y: (point.y - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2
    }))

    return { canConnect: true, path: realPath }
}

// 辅助函数：检查是否可以直接连接
const canConnectDirectly = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): boolean => {
    if (start.x === end.x) {
        // 垂直连接
        const minY = Math.min(start.y, end.y)
        const maxY = Math.max(start.y, end.y)
        for (let y = minY + 1; y < maxY; y++) {
            if (grid[y][start.x]) return false
        }
        return true
    }
    if (start.y === end.y) {
        // 水平连接
        const minX = Math.min(start.x, end.x)
        const maxX = Math.max(start.x, end.x)
        for (let x = minX + 1; x < maxX; x++) {
            if (grid[start.y][x]) return false
        }
        return true
    }
    return false
}

// 辅助函数：寻找一个转角的路径
const findOneCornerPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
    // 尝试通过水平-垂直路径连接
    const corner1 = { x: end.x, y: start.y }
    if (!grid[corner1.y][corner1.x] && canConnectDirectly(start, corner1, grid) && canConnectDirectly(corner1, end, grid)) {
        return [start, corner1, end]
    }

    // 尝试通过垂直-水平路径连接
    const corner2 = { x: start.x, y: end.y }
    if (!grid[corner2.y][corner2.x] && canConnectDirectly(start, corner2, grid) && canConnectDirectly(corner2, end, grid)) {
        return [start, corner2, end]
    }

    return null
}

// 辅助函数：寻找两个转角的路径
const findTwoCornerPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
    // 遍历所有可能的第一个转角点
    for (let x = 0; x < grid[0].length; x++) {
        const corner1 = { x, y: start.y }
        if (x !== start.x && !grid[corner1.y][corner1.x] && canConnectDirectly(start, corner1, grid)) {
            const corner2 = { x, y: end.y }
            if (!grid[corner2.y][corner2.x] && canConnectDirectly(corner1, corner2, grid) && canConnectDirectly(corner2, end, grid)) {
                return [start, corner1, corner2, end]
            }
        }
    }

    // 遍历所有可能的第一个转角点（垂直方向）
    for (let y = 0; y < grid.length; y++) {
        const corner1 = { x: start.x, y }
        if (y !== start.y && !grid[corner1.y][corner1.x] && canConnectDirectly(start, corner1, grid)) {
            const corner2 = { x: end.x, y }
            if (!grid[corner2.y][corner2.x] && canConnectDirectly(corner1, corner2, grid) && canConnectDirectly(corner2, end, grid)) {
                return [start, corner1, corner2, end]
            }
        }
    }

    return null
}

// 主要路径查找函数
const findPath = (start: { x: number, y: number }, end: { x: number, y: number }, grid: boolean[][]): { x: number, y: number }[] | null => {
    // 检查直接连接
    if (canConnectDirectly(start, end, grid)) {
        return [start, end]
    }

    // 检查一个转角的路径
    const oneCornerPath = findOneCornerPath(start, end, grid)
    if (oneCornerPath) {
        return oneCornerPath
    }

    // 检查两个转角的路径
    const twoCornerPath = findTwoCornerPath(start, end, grid)
    if (twoCornerPath) {
        return twoCornerPath
    }

    return null
} 