import { DIRECTIONS, LEVELS, Level, Position, TileType, STYLES } from '../types'

export class GameScene extends Phaser.Scene {
  private tileSize: number
  private currentLevel!: Level
  private currentLevelIndex: number = 0
  private player!: Phaser.GameObjects.Sprite
  private boxes: Phaser.GameObjects.Sprite[] = []
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private isMoving: boolean = false
  private levelText!: Phaser.GameObjects.Text
  private gameObjects: Phaser.GameObjects.GameObject[] = []
  private isMobile: boolean

  constructor() {
    super({ key: 'GameScene' })
    this.isMobile = window.innerWidth < 768
    this.tileSize = this.isMobile ? STYLES.responsive.mobile.tileSize : STYLES.responsive.desktop.tileSize
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
    
    // 设置背景颜色
    this.cameras.main.setBackgroundColor(STYLES.background.game)

    // 初始化关卡
    this.currentLevel = JSON.parse(JSON.stringify(LEVELS[this.currentLevelIndex]))

    const fontSize = this.isMobile ? STYLES.responsive.mobile.fontSize : STYLES.responsive.desktop.fontSize
    const padding = this.isMobile ? STYLES.responsive.mobile.padding : STYLES.responsive.desktop.padding

    // 添加关卡文本
    this.levelText = this.add.text(
      this.isMobile ? this.cameras.main.width - 100 : this.cameras.main.width - 150,
      this.isMobile ? 20 : 30,
      `第 ${this.currentLevelIndex + 1} 关`,
      { ...STYLES.gameStatus, fontSize: fontSize.text }
    )
    this.gameObjects.push(this.levelText)

    // 添加重开按钮
    const restartButton = this.add.text(
      this.isMobile ? this.cameras.main.width - 100 : this.cameras.main.width - 150,
      this.isMobile ? 60 : 80,
      '重新开始',
      { 
        ...STYLES.button, 
        fontSize: fontSize.button,
        padding: { x: padding.button.x, y: padding.button.y }
      }
    )
      .setInteractive()
      .on('pointerover', () => {
        restartButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        restartButton.setTint(STYLES.button.hover.tint)
        restartButton.setScale(this.isMobile ? STYLES.responsive.mobile.scale.button : STYLES.responsive.desktop.scale.button)
      })
      .on('pointerout', () => {
        restartButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        restartButton.clearTint()
        restartButton.setScale(1)
      })
      .on('pointerdown', () => this.restartLevel())
    this.gameObjects.push(restartButton)

    this.cursors = this.input.keyboard.createCursorKeys()

    // 计算游戏区域的偏移量，使其居中
    const offsetX = (this.cameras.main.width - this.currentLevel.map[0].length * this.tileSize) / 2
    const offsetY = (this.cameras.main.height - this.currentLevel.map.length * this.tileSize) / 2

    // 创建游戏地图
    this.createGameMap(offsetX, offsetY)

    // 添加返回按钮
    const backButton = this.add.text(
      this.isMobile ? 30 : 50,
      this.isMobile ? 20 : 30,
      '返回',
      { 
        ...STYLES.backButton, 
        fontSize: fontSize.button,
        padding: { x: padding.button.x, y: padding.button.y }
      }
    )
      .setInteractive()
      .on('pointerover', () => {
        backButton.setStyle({ backgroundColor: STYLES.backButton.hover.backgroundColor })
        backButton.setTint(STYLES.backButton.hover.tint)
        backButton.setScale(this.isMobile ? STYLES.responsive.mobile.scale.button : STYLES.responsive.desktop.scale.button)
      })
      .on('pointerout', () => {
        backButton.setStyle({ backgroundColor: STYLES.backButton.backgroundColor })
        backButton.clearTint()
        backButton.setScale(1)
      })
      .on('pointerdown', () => this.scene.start('StartScene'))
    this.gameObjects.push(backButton)

    // 添加操作提示
    const hint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - (this.isMobile ? 30 : 40),
      this.isMobile ? '点击屏幕移动，双击重新开始' : '使用方向键移动，R键重新开始',
      { ...STYLES.hint, fontSize: fontSize.text }
    ).setOrigin(0.5)
    this.gameObjects.push(hint)

    // 监听键盘事件
    this.input.keyboard.on('keydown', this.handleKeyDown, this)

    // 如果是移动设备，添加触摸控制
    if (this.isMobile) {
      this.input.on('pointerdown', this.handleTouchInput, this)
    }
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

  private handleTouchInput(pointer: Phaser.Input.Pointer) {
    if (!this.isMoving) {
      const centerX = this.cameras.main.width / 2
      const centerY = this.cameras.main.height / 2
      
      // 计算触摸点相对于屏幕中心的位置
      const deltaX = pointer.x - centerX
      const deltaY = pointer.y - centerY
      
      // 设置最小移动阈值，避免误触
      const minSwipeDistance = 20
      
      // 根据触摸位置判断移动方向，增加最小移动距离判断
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // 水平移动
        if (deltaX > 0) {
          this.movePlayer(DIRECTIONS.RIGHT)
        } else {
          this.movePlayer(DIRECTIONS.LEFT)
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
        // 垂直移动
        if (deltaY > 0) {
          this.movePlayer(DIRECTIONS.DOWN)
        } else {
          this.movePlayer(DIRECTIONS.UP)
        }
      }
    }
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
        
        const winText = this.add.text(width/2, height/2, '恭喜过关！\n准备进入下一关...', STYLES.winMessage)
          .setOrigin(0.5)
          .setShadow(2, 2, '#2d2d2d', 8, true)

        // 2秒后进入下一关
        this.time.delayedCall(2000, () => {
          this.scene.restart({ level: this.currentLevelIndex + 1 })
        })
      } else {
        // 显示通关消息
        const width = this.cameras.main!.width
        const height = this.cameras.main!.height
        
        const winText = this.add.text(width/2, height/2, '恭喜通关！', STYLES.winMessage)
          .setOrigin(0.5)
          .setShadow(2, 2, '#2d2d2d', 8, true)

        // 3秒后返回主菜单
        this.time.delayedCall(3000, () => {
          this.scene.start('StartScene')
        })
      }
    }
  }
} 