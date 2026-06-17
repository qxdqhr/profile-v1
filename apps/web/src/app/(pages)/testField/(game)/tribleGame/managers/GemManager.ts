import { Scene } from 'phaser';
import { GEMS, GAME_CONFIG } from '../const';
import { ScoreManager } from './ScoreManager';

interface Gem extends Phaser.GameObjects.Sprite {
    gemType: number;
    gridX: number;
    gridY: number;
}

export class GemManager {
  private scene: Scene;
  private gems: (Gem | null)[][] = [];
  private selectedGem: Gem | null = null;
  private scoreManager: ScoreManager;

  constructor(scene: Scene, scoreManager: ScoreManager) {
    this.scene = scene;
    this.scoreManager = scoreManager;
    this.createGrid();
  }

  private getGridStartPosition(): { startX: number; startY: number } {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    const gridWidth = GAME_CONFIG.GRID_SIZE * GAME_CONFIG.GEM_SIZE;
    const gridHeight = GAME_CONFIG.GRID_SIZE * GAME_CONFIG.GEM_SIZE;

    return {
      startX: (gameWidth - gridWidth) / 2,
      startY: (gameHeight - gridHeight) / 2
    };
  }

  private createGrid() {
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
      this.gems[y] = [];
      for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        const gem = this.createGem(x, y);
        this.gems[y][x] = gem;
      }
    }
  }

  private createGem(x: number, y: number): Gem {
    let gemType;
    const gemTypes = Object.values(GEMS);
    const { startX, startY } = this.getGridStartPosition();
        
    do {
      gemType = Phaser.Math.Between(0, gemTypes.length - 1);
    } while (this.wouldCauseMatch(x, y, gemType));

    const posX = startX + x * GAME_CONFIG.GEM_SIZE + GAME_CONFIG.GEM_SIZE / 2;
    const posY = startY + y * GAME_CONFIG.GEM_SIZE + GAME_CONFIG.GEM_SIZE / 2;

    const gem = this.scene.add.sprite(posX, posY, 'gem') as Gem;
    gem.setInteractive();
    gem.setScale(0.5);
        
    gem.gemType = gemType;
    gem.gridX = x;
    gem.gridY = y;

    gem.setTint(gemTypes[gemType].color);
    return gem;
  }

  public handleGemClick(gem: Gem) {
    if (!this.selectedGem) {
      this.selectedGem = gem;
      gem.setScale(0.6);
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
    const tempX = gem1.x;
    const tempY = gem1.y;
    const tempGridX = gem1.gridX;
    const tempGridY = gem1.gridY;
    const gem2GridX = gem2.gridX;
    const gem2GridY = gem2.gridY;

    gem1.gridX = gem2.gridX;
    gem1.gridY = gem2.gridY;
    gem2.gridX = tempGridX;
    gem2.gridY = tempGridY;
    this.gems[gem1.gridY][gem1.gridX] = gem1;
    this.gems[gem2.gridY][gem2.gridX] = gem2;

    const matches = this.findMatches();
        
    if (matches.length > 0) {
      this.scene.tweens.add({
        targets: gem1,
        x: gem2.x,
        y: gem2.y,
        duration: 200,
      });

      this.scene.tweens.add({
        targets: gem2,
        x: tempX,
        y: tempY,
        duration: 200,
        onComplete: () => {
          this.removeAndRefill(matches);
        }
      });
    } else {
      gem1.gridX = tempGridX;
      gem1.gridY = tempGridY;
      gem2.gridX = gem2GridX;
      gem2.gridY = gem2GridY;
      this.gems[tempGridY][tempGridX] = gem1;
      this.gems[gem2GridY][gem2GridX] = gem2;

      this.scene.tweens.add({
        targets: gem1,
        x: tempX,
        y: tempY,
        duration: 200
      });

      this.scene.tweens.add({
        targets: gem2,
        x: gem2.x,
        y: gem2.y,
        duration: 200
      });
    }
  }

  private findMatches(): Gem[] {
    const matches: Gem[] = [];
    const checked = new Set<Gem>();

    // 水平匹配检查
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
      let currentType = -1;
      let matchLength = 1;
      let startX = 0;

      for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        const gem = this.gems[y][x];
        if (gem) {
          if (gem.gemType === currentType) {
            matchLength++;
          } else {
            if (matchLength >= 3) {
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
      if (matchLength >= 3) {
        for (let i = 0; i < matchLength; i++) {
          const matchGem = this.gems[y][startX + i];
          if (matchGem && !checked.has(matchGem)) {
            matches.push(matchGem);
            checked.add(matchGem);
          }
        }
      }
    }

    // 垂直匹配检查
    for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
      let currentType = -1;
      let matchLength = 1;
      let startY = 0;

      for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
        const gem = this.gems[y][x];
        if (gem) {
          if (gem.gemType === currentType) {
            matchLength++;
          } else {
            if (matchLength >= 3) {
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
      if (matchLength >= 3) {
        for (let i = 0; i < matchLength; i++) {
          const matchGem = this.gems[startY + i][x];
          if (matchGem && !checked.has(matchGem)) {
            matches.push(matchGem);
            checked.add(matchGem);
          }
        }
      }
    }

    return matches;
  }

  private removeAndRefill(matches: Gem[]) {
    // 更新分数
    this.scoreManager.addScore(matches.length);

    matches.forEach(gem => {
      this.scene.tweens.add({
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

    this.scene.time.delayedCall(250, () => {
      this.fillEmptySpaces();
    });
  }

  private fillEmptySpaces() {
    let totalAnimations = 0;
    let completedAnimations = 0;
    const { startX, startY } = this.getGridStartPosition();

    for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
      let fallDistance = 0;
            
      for (let y = GAME_CONFIG.GRID_SIZE - 1; y >= 0; y--) {
        if (!this.gems[y][x]) {
          fallDistance++;
        } else if (fallDistance > 0) {
          const gem = this.gems[y][x];
          if (gem) {
            this.gems[y + fallDistance][x] = gem;
            this.gems[y][x] = null;
                        
            totalAnimations++;
            this.scene.tweens.add({
              targets: gem,
              y: startY + (y + fallDistance) * GAME_CONFIG.GEM_SIZE + GAME_CONFIG.GEM_SIZE / 2,
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

      for (let y = fallDistance - 1; y >= 0; y--) {
        const newGem = this.createGem(x, -fallDistance + y);
        this.gems[y][x] = newGem;
                
        newGem.y = startY - (fallDistance - y) * GAME_CONFIG.GEM_SIZE + GAME_CONFIG.GEM_SIZE / 2;
                
        totalAnimations++;
        this.scene.tweens.add({
          targets: newGem,
          y: startY + y * GAME_CONFIG.GEM_SIZE + GAME_CONFIG.GEM_SIZE / 2,
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

    if (totalAnimations === 0) {
      this.checkMatches();
    }
  }

  private checkMatches() {
    const matches = this.findMatches();
    if (matches.length > 0) {
      this.removeAndRefill(matches);
    }
  }

  private wouldCauseMatch(x: number, y: number, gemType: number): boolean {
    // 水平检查
    if (x >= 2 && 
            this.gems[y]?.[x - 1]?.gemType === gemType && 
            this.gems[y]?.[x - 2]?.gemType === gemType) {
      return true;
    }
    if (x >= 1 && x < GAME_CONFIG.GRID_SIZE - 1 &&
            this.gems[y]?.[x - 1]?.gemType === gemType && 
            this.gems[y]?.[x + 1]?.gemType === gemType) {
      return true;
    }
    if (x < GAME_CONFIG.GRID_SIZE - 2 &&
            this.gems[y]?.[x + 1]?.gemType === gemType && 
            this.gems[y]?.[x + 2]?.gemType === gemType) {
      return true;
    }

    // 垂直检查
    if (y >= 2 && 
            this.gems[y - 1]?.[x]?.gemType === gemType && 
            this.gems[y - 2]?.[x]?.gemType === gemType) {
      return true;
    }
    if (y >= 1 && y < GAME_CONFIG.GRID_SIZE - 1 &&
            this.gems[y - 1]?.[x]?.gemType === gemType && 
            this.gems[y + 1]?.[x]?.gemType === gemType) {
      return true;
    }
    if (y < GAME_CONFIG.GRID_SIZE - 2 &&
            this.gems[y + 1]?.[x]?.gemType === gemType && 
            this.gems[y + 2]?.[x]?.gemType === gemType) {
      return true;
    }

    return false;
  }

  public disableInteraction() {
    // 禁用所有宝石的交互
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
      for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        const gem = this.gems[y][x];
        if (gem) {
          gem.disableInteractive();
        }
      }
    }
    // 清除选中状态
    if (this.selectedGem) {
      this.selectedGem.setScale(0.5);
      this.selectedGem = null;
    }
  }
} 