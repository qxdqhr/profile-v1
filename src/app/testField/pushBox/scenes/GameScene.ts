import { DIRECTIONS, LEVELS, Level, Position, TileType } from '../types'

export class GameScene extends Phaser.Scene {
  private tileSize: number = 64
  private currentLevel!: Level
  private currentLevelIndex: number = 0
  private player!: Phaser.GameObjects.Sprite
  private boxes: Phaser.GameObjects.Sprite[] = []
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isMoving: boolean = false
  private levelText!: Phaser.GameObjects.Text
  private gameObjects: Phaser.GameObjects.GameObject[] = []

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number }) {
    this.currentLevelIndex = data.level || 0
    this.gameObjects = []
  }

  preload() {
    this.load.image('wall', '/pushbox/images/wall.png')
    this.load.image('box', '/pushbox/images/box.png')
    this.load.image('target', '/pushbox/images/target.png')
    this.load.image('player', '/pushbox/images/player.png')
    this.load.image('box_on_target', '/pushbox/images/box_on_target.png')
  }

  create() {
    if (!this.cameras.main ||
        !this.input ||
        !this.input.keyboard
    ) return;
    
    // 初始化关卡
    this.currentLevel = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]))

    // 添加关卡文本
    this.levelText = this.add.text(this.cameras.main.width - 150, 30, `第 ${this.currentLevelIndex + 1} 关`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 10, y: 5 }
    })
    this.gameObjects.push(this.levelText)

    // 添加重开按钮
    const restartButton = this.add.text(this.cameras.main.width - 150, 80, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 10, y: 5 }
    })
    .setInteractive()
    .on('pointerdown', () => this.restartLevel())
    this.gameObjects.push(restartButton)

    this.cursors = this.input.keyboard.createCursorKeys()

    // 计算游戏区域的偏移量，使其居中
    const offsetX = (this.cameras.main.width - this.currentLevel.map[0].length * this.tileSize) / 2
    const offsetY = (this.cameras.main.height - this.currentLevel.map.length * this.tileSize) / 2

    // 创建游戏地图
    this.createGameMap(offsetX, offsetY)

    // 添加返回按钮
    const backButton = this.add.text(50, 30, '返回', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 10, y: 5 }
    })
    .setInteractive()
    .on('pointerdown', () => this.scene.start('StartScene'))
    this.gameObjects.push(backButton)

    // 监听键盘事件
    this.input.keyboard.on('keydown', this.handleKeyDown, this)
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.isMoving) return

    // 按R键重开当前关卡
    if (event.code === 'KeyR') {
      this.restartLevel()
      return
    }

    let direction: Position | undefined
    switch (event.code) {
      case 'ArrowUp':
        direction = DIRECTIONS.UP
        break
      case 'ArrowDown':
        direction = DIRECTIONS.DOWN
        break
      case 'ArrowLeft':
        direction = DIRECTIONS.LEFT
        break
      case 'ArrowRight':
        direction = DIRECTIONS.RIGHT
        break
      default:
        return
    }

    this.movePlayer(direction)
  }

  private restartLevel() {
    // 清除所有游戏对象
    this.boxes.forEach(box => box.destroy())
    this.boxes = []
    if (this.player) this.player.destroy()
    this.gameObjects.forEach(obj => obj.destroy())
    this.gameObjects = []
    
    // 重新创建场景
    this.create()
  }

  private createGameMap(offsetX: number, offsetY: number) {
    // 清除现有的箱子数组
    this.boxes = []

    // 绘制地图
    for (let y = 0; y < this.currentLevel.map.length; y++) {
      for (let x = 0; x < this.currentLevel.map[y].length; x++) {
        const tileX = offsetX + x * this.tileSize
        const tileY = offsetY + y * this.tileSize

        // 绘制目标点
        if (this.isTarget({ x, y })) {
          const target = this.add.image(tileX + this.tileSize/2, tileY + this.tileSize/2, 'target')
          this.gameObjects.push(target)
        }

        // 绘制墙
        if (this.currentLevel.map[y][x] === TileType.WALL) {
          const wall = this.add.image(tileX + this.tileSize/2, tileY + this.tileSize/2, 'wall')
          this.gameObjects.push(wall)
        }

        // 绘制箱子
        if (this.isBox({ x, y })) {
          const box = this.add.sprite(tileX + this.tileSize/2, tileY + this.tileSize/2, 
            this.isTarget({ x, y }) ? 'box_on_target' : 'box')
          this.boxes.push(box)
        }

        // 绘制玩家
        if (this.currentLevel.map[y][x] === TileType.PLAYER) {
          this.player = this.add.sprite(tileX + this.tileSize/2, tileY + this.tileSize/2, 'player')
        }
      }
    }
  }

  private movePlayer(direction: Position) {
    const newPos = {
      x: this.currentLevel.player.x + direction.x,
      y: this.currentLevel.player.y + direction.y
    }

    // 检查是否可以移动
    if (this.canMove(newPos)) {
      this.isMoving = true

      // 如果前方是箱子，先移动箱子
      if (this.isBox(newPos)) {
        const boxNewPos = {
          x: newPos.x + direction.x,
          y: newPos.y + direction.y
        }
        this.moveBox(newPos, boxNewPos)
      }

      // 更新玩家位置
      this.currentLevel.map[this.currentLevel.player.y][this.currentLevel.player.x] = 
        this.isTarget(this.currentLevel.player) ? TileType.TARGET : TileType.EMPTY
      this.currentLevel.map[newPos.y][newPos.x] = 
        this.isTarget(newPos) ? TileType.PLAYER_ON_TARGET : TileType.PLAYER
      this.currentLevel.player = newPos

      // 移动玩家精灵
      this.tweens.add({
        targets: this.player,
        x: this.player.x + direction.x * this.tileSize,
        y: this.player.y + direction.y * this.tileSize,
        duration: 200,
        onComplete: () => {
          this.isMoving = false
          this.checkWin()
        }
      })
    }
  }

  private moveBox(currentPos: Position, newPos: Position) {
    // 更新地图数据
    this.currentLevel.map[currentPos.y][currentPos.x] = 
      this.isTarget(currentPos) ? TileType.TARGET : TileType.EMPTY
    this.currentLevel.map[newPos.y][newPos.x] = 
      this.isTarget(newPos) ? TileType.BOX_ON_TARGET : TileType.BOX

    // 更新箱子位置
    const boxIndex = this.currentLevel.boxes.findIndex(
      box => box.x === currentPos.x && box.y === currentPos.y
    )
    if (boxIndex !== -1 && this.boxes[boxIndex]) {
      this.currentLevel.boxes[boxIndex] = newPos
      const box = this.boxes[boxIndex]
      // 移动箱子精灵
      this.tweens.add({
        targets: box,
        x: box.x + (newPos.x - currentPos.x) * this.tileSize,
        y: box.y + (newPos.y - currentPos.y) * this.tileSize,
        duration: 200
      })
    }
  }

  private canMove(pos: Position): boolean {
    // 检查是否超出边界
    if (pos.x < 0 || pos.x >= this.currentLevel.map[0].length ||
        pos.y < 0 || pos.y >= this.currentLevel.map.length) {
      return false
    }

    // 检查是否是墙
    if (this.currentLevel.map[pos.y][pos.x] === TileType.WALL) {
      return false
    }

    // 如果是箱子，检查箱子是否可以移动
    if (this.isBox(pos)) {
      const direction = {
        x: pos.x - this.currentLevel.player.x,
        y: pos.y - this.currentLevel.player.y
      }
      const behindBox = {
        x: pos.x + direction.x,
        y: pos.y + direction.y
      }
      return this.canMove(behindBox) && !this.isBox(behindBox)
    }

    return true
  }

  private isBox(pos: Position): boolean {
    const tile = this.currentLevel.map[pos.y][pos.x]
    return tile === TileType.BOX || tile === TileType.BOX_ON_TARGET
  }

  private isTarget(pos: Position): boolean {
    return this.currentLevel.targets.some(target => 
      target.x === pos.x && target.y === pos.y
    )
  }

  private checkWin() {
    const win = this.currentLevel.targets.every(target =>
      this.currentLevel.boxes.some(box =>
        box.x === target.x && box.y === target.y
      )
    )

    if (win) {
      if (this.currentLevelIndex < LEVELS.length - 1) {
        // 显示过关消息
        const width = this.cameras.main!.width
        const height = this.cameras.main!.height
        
        const winText = this.add.text(width/2, height/2, '恭喜过关！\n准备进入下一关...', {
          fontSize: '48px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 },
          align: 'center'
        }).setOrigin(0.5)

        // 2秒后进入下一关
        this.time.delayedCall(2000, () => {
          this.scene.restart({ level: this.currentLevelIndex + 1 })
        })
      } else {
        // 显示通关消息
        const width = this.cameras.main!.width
        const height = this.cameras.main!.height
        
        const winText = this.add.text(width/2, height/2, '恭喜通关！', {
          fontSize: '48px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5)

        // 3秒后返回主菜单
        this.time.delayedCall(3000, () => {
          this.scene.start('StartScene')
        })
      }
    }
  }
} 