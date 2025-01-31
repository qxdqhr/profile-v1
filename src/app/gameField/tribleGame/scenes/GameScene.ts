import { Scene } from 'phaser';
import { GEMS, GemType } from '../const';

interface Gem extends Phaser.GameObjects.Sprite {
    gemType: number;
    gridX: number;
    gridY: number;
}

export class GameScene extends Scene {
    private gems: (Gem | null)[][] = [];
    private selectedGem: Gem | null = null;
    private GRID_SIZE = 8;
    private GEM_SIZE = 64;
    private OFFSET_X = 100;
    private OFFSET_Y = 100;

    // 添加颜色映射常量
    private readonly GEM_COLORS = {
        RED: { type: 0, color: 0xff0000 },
        GREEN: { type: 1, color: 0x00aa00 },
        BLUE: { type: 2, color: 0x0000ff },
        YELLOW: { type: 3, color: 0xffff00 },
        PURPLE: { type: 4, color: 0xff00ff },
        CYAN: { type: 5, color: 0x00ffff }
    };

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('gem', '/trible/images/gems.png');
    }

    create() {
        // 设置白色背景
        this.cameras.main.setBackgroundColor('#FFFFFF');
        
        this.createGrid();
        this.input.on('gameobjectdown', this.onGemClick, this);
    }

    private createGrid() {
        for (let y = 0; y < this.GRID_SIZE; y++) {
            this.gems[y] = [];
            for (let x = 0; x < this.GRID_SIZE; x++) {
                const gem = this.createGem(x, y);
                this.gems[y][x] = gem;
            }
        }
    }

    private createGem(x: number, y: number): Gem {
        let gemType;
        const gemTypes = Object.values(GEMS);
        
        // 检查并避免创建匹配
        do {
            gemType = Phaser.Math.Between(0, gemTypes.length - 1);
        } while (this.wouldCauseMatch(x, y, gemType));

        const posX = this.OFFSET_X + x * this.GEM_SIZE;
        const posY = this.OFFSET_Y + y * this.GEM_SIZE;

        const gem = this.add.sprite(posX, posY, 'gem') as Gem;
        gem.setInteractive();
        gem.setScale(0.5);
        
        gem.gemType = gemType;
        gem.gridX = x;
        gem.gridY = y;

        // 使用固定的颜色映射
        gem.setTint(gemTypes[gemType].color);
        
        return gem;
    }

    // 新增方法：检查某个位置放置特定类型的宝石是否会导致匹配
    private wouldCauseMatch(x: number, y: number, gemType: number): boolean {
        // 检查水平方向的所有可能匹配
        // 检查左边两个
        if (x >= 2 && 
            this.gems[y]?.[x - 1]?.gemType === gemType && 
            this.gems[y]?.[x - 2]?.gemType === gemType) {
            return true;
        }
        // 检查左一右一的情况（当前宝石在中间）
        if (x >= 1 && x < this.GRID_SIZE - 1 &&
            this.gems[y]?.[x - 1]?.gemType === gemType && 
            this.gems[y]?.[x + 1]?.gemType === gemType) {
            return true;
        }
        // 检查右边两个
        if (x < this.GRID_SIZE - 2 &&
            this.gems[y]?.[x + 1]?.gemType === gemType && 
            this.gems[y]?.[x + 2]?.gemType === gemType) {
            return true;
        }

        // 检查垂直方向的所有可能匹配
        // 检查上面两个
        if (y >= 2 && 
            this.gems[y - 1]?.[x]?.gemType === gemType && 
            this.gems[y - 2]?.[x]?.gemType === gemType) {
            return true;
        }
        // 检查上一下一的情况（当前宝石在中间）
        if (y >= 1 && y < this.GRID_SIZE - 1 &&
            this.gems[y - 1]?.[x]?.gemType === gemType && 
            this.gems[y + 1]?.[x]?.gemType === gemType) {
            return true;
        }
        // 检查下面两个
        if (y < this.GRID_SIZE - 2 &&
            this.gems[y + 1]?.[x]?.gemType === gemType && 
            this.gems[y + 2]?.[x]?.gemType === gemType) {
            return true;
        }

        return false;
    }

    private onGemClick(pointer: Phaser.Input.Pointer, gem: Gem) {
        if (!this.selectedGem) {
            this.selectedGem = gem;
            gem.setScale(0.6); // 选中效果
        } else {
            if (this.isAdjacent(this.selectedGem, gem)) {
                this.swapGems(this.selectedGem, gem);
            }
            this.selectedGem.setScale(0.5);
            this.selectedGem = null;
        }
    }

    private isAdjacent(gem1: Gem, gem2: Gem): boolean {
        const dx = Math.abs(gem1.gridX - gem2.gridX);
        const dy = Math.abs(gem1.gridY - gem2.gridY);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    private swapGems(gem1: Gem, gem2: Gem) {
        // 保存原始位置
        const tempX = gem1.x;
        const tempY = gem1.y;
        const tempGridX = gem1.gridX;
        const tempGridY = gem1.gridY;
        const gem2GridX = gem2.gridX;
        const gem2GridY = gem2.gridY;

        // 先在数组中交换位置
        gem1.gridX = gem2.gridX;
        gem1.gridY = gem2.gridY;
        gem2.gridX = tempGridX;
        gem2.gridY = tempGridY;
        this.gems[gem1.gridY][gem1.gridX] = gem1;
        this.gems[gem2.gridY][gem2.gridX] = gem2;

        // 检查是否会形成匹配
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // 如果有匹配，执行动画并消除
            this.tweens.add({
                targets: gem1,
                x: gem2.x,
                y: gem2.y,
                duration: 200,
            });

            this.tweens.add({
                targets: gem2,
                x: tempX,
                y: tempY,
                duration: 200,
                onComplete: () => {
                    this.removeAndRefill(matches);
                }
            });
        } else {
            // 如果没有匹配，恢复原位
            gem1.gridX = tempGridX;
            gem1.gridY = tempGridY;
            gem2.gridX = gem2GridX;
            gem2.gridY = gem2GridY;
            this.gems[tempGridY][tempGridX] = gem1;
            this.gems[gem2GridY][gem2GridX] = gem2;

            this.tweens.add({
                targets: gem1,
                x: tempX,
                y: tempY,
                duration: 200
            });

            this.tweens.add({
                targets: gem2,
                x: gem2.x,
                y: gem2.y,
                duration: 200
            });
        }
    }

    // 新增方法：查找所有匹配
    private findMatches(): Gem[] {
        const matches: Gem[] = [];
        const checked = new Set<Gem>();

        // 添加调试日志函数
        const logMatch = (direction: string, x: number, y: number, length: number, type: number) => {
            console.log(`${direction} match found at (${x},${y}), length: ${length}, type: ${type}`);
        };

        // 检查水平匹配
        for (let y = 0; y < this.GRID_SIZE; y++) {
            let currentType = -1;
            let matchLength = 1;
            let startX = 0;

            for (let x = 0; x < this.GRID_SIZE; x++) {
                const gem = this.gems[y][x];
                if (gem) {
                    if (gem.gemType === currentType) {
                        matchLength++;
                    } else {
                        if (matchLength >= 3) {
                            logMatch('Horizontal', startX, y, matchLength, currentType);
                            for (let i = 0; i < matchLength; i++) {
                                const matchGem = this.gems[y][startX + i];
                                if (matchGem && !checked.has(matchGem)) {
                                    matches.push(matchGem);
                                    checked.add(matchGem);
                                }
                            }
                        }
                        currentType = gem.gemType;
                        matchLength = 1;
                        startX = x;
                    }
                } else {
                    if (matchLength >= 3) {
                        logMatch('Horizontal', startX, y, matchLength, currentType);
                        for (let i = 0; i < matchLength; i++) {
                            const matchGem = this.gems[y][startX + i];
                            if (matchGem && !checked.has(matchGem)) {
                                matches.push(matchGem);
                                checked.add(matchGem);
                            }
                        }
                    }
                    currentType = -1;
                    matchLength = 1;
                }
            }
            // 检查行末尾的匹配
            if (matchLength >= 3) {
                logMatch('Horizontal end', startX, y, matchLength, currentType);
                for (let i = 0; i < matchLength; i++) {
                    const matchGem = this.gems[y][startX + i];
                    if (matchGem && !checked.has(matchGem)) {
                        matches.push(matchGem);
                        checked.add(matchGem);
                    }
                }
            }
        }

        // 检查垂直匹配
        for (let x = 0; x < this.GRID_SIZE; x++) {
            let currentType = -1;
            let matchLength = 1;
            let startY = 0;

            for (let y = 0; y < this.GRID_SIZE; y++) {
                const gem = this.gems[y][x];
                if (gem) {
                    if (gem.gemType === currentType) {
                        matchLength++;
                    } else {
                        if (matchLength >= 3) {
                            logMatch('Vertical', x, startY, matchLength, currentType);
                            for (let i = 0; i < matchLength; i++) {
                                const matchGem = this.gems[startY + i][x];
                                if (matchGem && !checked.has(matchGem)) {
                                    matches.push(matchGem);
                                    checked.add(matchGem);
                                }
                            }
                        }
                        currentType = gem.gemType;
                        matchLength = 1;
                        startY = y;
                    }
                } else {
                    if (matchLength >= 3) {
                        logMatch('Vertical', x, startY, matchLength, currentType);
                        for (let i = 0; i < matchLength; i++) {
                            const matchGem = this.gems[startY + i][x];
                            if (matchGem && !checked.has(matchGem)) {
                                matches.push(matchGem);
                                checked.add(matchGem);
                            }
                        }
                    }
                    currentType = -1;
                    matchLength = 1;
                }
            }
            // 检查列末尾的匹配
            if (matchLength >= 3) {
                logMatch('Vertical end', x, startY, matchLength, currentType);
                for (let i = 0; i < matchLength; i++) {
                    const matchGem = this.gems[startY + i][x];
                    if (matchGem && !checked.has(matchGem)) {
                        matches.push(matchGem);
                        checked.add(matchGem);
                    }
                }
            }
        }

        // 打印所有找到的匹配
        if (matches.length > 0) {
            console.log('Found matches:', matches.map(gem => `(${gem.gridX},${gem.gridY}:${gem.gemType})`));
        }

        return matches;
    }

    private checkMatches() {
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.removeAndRefill(matches);
        }
    }

    private fillEmptySpaces() {
        let totalAnimations = 0;
        let completedAnimations = 0;

        // 第一步：现有宝石下落
        for (let x = 0; x < this.GRID_SIZE; x++) {
            let fallDistance = 0;
            
            // 从底部向上遍历
            for (let y = this.GRID_SIZE - 1; y >= 0; y--) {
                if (!this.gems[y][x]) {
                    fallDistance++;
                } else if (fallDistance > 0) {
                    const gem = this.gems[y][x];
                    if (gem) {
                        this.gems[y + fallDistance][x] = gem;
                        this.gems[y][x] = null;
                        
                        totalAnimations++;
                        this.tweens.add({
                            targets: gem,
                            y: this.OFFSET_Y + (y + fallDistance) * this.GEM_SIZE,
                            duration: 200 * fallDistance,
                            ease: 'Bounce.easeOut',
                            onComplete: () => {
                                gem.gridY = y + fallDistance;
                                completedAnimations++;
                                if (completedAnimations === totalAnimations) {
                                    this.checkMatches();
                                }
                            }
                        });
                    }
                }
            }

            // 第二步：在顶部生成新的宝石
            for (let y = fallDistance - 1; y >= 0; y--) {
                const newGem = this.createGem(x, -fallDistance + y);
                this.gems[y][x] = newGem;
                
                newGem.y = this.OFFSET_Y - (fallDistance - y) * this.GEM_SIZE;
                
                totalAnimations++;
                this.tweens.add({
                    targets: newGem,
                    y: this.OFFSET_Y + y * this.GEM_SIZE,
                    duration: 200 * (fallDistance - y),
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        newGem.gridY = y;
                        completedAnimations++;
                        if (completedAnimations === totalAnimations) {
                            this.checkMatches();
                        }
                    }
                });
            }
        }

        // 如果没有动画需要播放，直接检查匹配
        if (totalAnimations === 0) {
            this.checkMatches();
        }
    }

    private removeAndRefill(matches: Gem[]) {
        // 添加消除动画
        matches.forEach(gem => {
            this.tweens.add({
                targets: gem,
                alpha: 0,
                scale: 0.3,
                duration: 200,
                onComplete: () => {
                    gem.destroy();
                    this.gems[gem.gridY][gem.gridX] = null;
                }
            });
        });

        // 延迟一下再开始填充
        this.time.delayedCall(250, () => {
            this.fillEmptySpaces();
        });
    }
}
