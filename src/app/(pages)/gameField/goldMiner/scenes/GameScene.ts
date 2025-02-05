import Phaser from 'phaser'
import { GameData } from '../types/gameData'

interface GameObjects {
  type: 'gold' | 'stone' | 'diamond'
  value: number
  weight: number
  color: number
  width: number
  height: number
}

export class GameScene extends Phaser.Scene {
  private hook!: Phaser.GameObjects.Line
  private hookHead!: Phaser.GameObjects.Arc
  private hookAngle: number = 90
  private hookSpeed: number = 2
  private isHookLaunched: number = 0 // 0: 摆动中, 1: 发射中, 2: 收回中
  private hookLength: number = 40
  private maxHookLength: number = window.innerHeight - 100
  private score: number = 0
  private timeLeft: number = 60
  private scoreText!: Phaser.GameObjects.Text
  private timeText!: Phaser.GameObjects.Text
  private currentLevel: number = 1
  private gameObjects: Phaser.GameObjects.Rectangle[] = []
  private gameData!: GameData

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level: number }) {
    this.currentLevel = data.level
    this.gameData = (this.game as Phaser.Game & { gameData: GameData }).gameData
    const levelConfig = this.gameData.levels[this.currentLevel - 1]
    
    this.score = 0
    this.timeLeft = levelConfig.timeLimit
  }

  create() {
    
    if (!this.cameras.main ||
        !this.input ||
        !this.input.keyboard
    ) return;

    const { width, height } = this.cameras.main

    // 创建矿工（简单的矩形表示）
    this.add.rectangle(width / 2, 50, 40, 60, 0x00ff00)

    // 创建钩子
    this.hook = this.add.line(width / 2, 50, 0, 0, 0, this.hookLength, 0xffffff)
    this.hookHead = this.add.circle(width / 2, 50 + this.hookLength, 5, 0xffffff)

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, '分数: 0', {
      fontSize: '24px',
      color: '#ffffff'
    })

    // 创建时间显示
    this.timeText = this.add.text(width - 150, 16, '时间: 60', {
      fontSize: '24px',
      color: '#ffffff'
    })

    // 生成游戏物品
    this.generateGameObjects()

    // 添加点击/空格键监听
    this.input.keyboard.on('keydown-SPACE', this.launchHook, this)
    this.input.on('pointerdown', this.launchHook, this)

    // 开始计时
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    })
  }

  private generateGameObjects() {
    const gameObjectsConfig: GameObjects[] = [
      { type: 'gold', value: 100, weight: 1, color: 0xffd700, width: 30, height: 30 },
      { type: 'stone', value: 20, weight: 2, color: 0x808080, width: 40, height: 40 },
      { type: 'diamond', value: 200, weight: 0.5, color: 0x00ffff, width: 20, height: 20 }
    ]

    // 根据关卡生成不同数量和类型的物品
    const objectCount = 5 + this.currentLevel * 2
    const { width, height } = this.cameras.main

    // 修改物品生成的位置范围
    const minY = 150  // 距离顶部最小距离
    const maxY = height - 150  // 距离底部最小距离
    const minX = 100  // 距离左边最小距离
    const maxX = width - 100  // 距离右边最小距离

    for (let i = 0; i < objectCount; i++) {
      const objectConfig = gameObjectsConfig[Phaser.Math.Between(0, gameObjectsConfig.length - 1)]
      const x = Phaser.Math.Between(minX, maxX)
      const y = Phaser.Math.Between(minY, maxY)

      const gameObject = this.add.rectangle(x, y, objectConfig.width, objectConfig.height, objectConfig.color)
      gameObject.setData('value', objectConfig.value)
      gameObject.setData('weight', objectConfig.weight)
      this.gameObjects.push(gameObject)
    }
  }

  private launchHook() {
    if (this.isHookLaunched === 0) {
      this.isHookLaunched = 1
    }
  }

  private updateTimer() {
    this.timeLeft--
    this.timeText.setText(`时间: ${this.timeLeft}`)

    if (this.timeLeft <= 0) {
      this.endGame()
    }
  }

  private endGame() {
    // 判断是否达到过关分数
    const targetScore = this.currentLevel * 200
    if (this.score >= targetScore) {
      this.scene.start('LevelCompleteScene', {
        level: this.currentLevel,
        score: this.score
      })
    } else {
      this.scene.start('GameOverScene', {
        level: this.currentLevel,
        score: this.score
      })
    }
  }

  update() {
    const { width } = this.cameras.main
    const hookStartX = width / 2
    const hookStartY = 50

    if (this.isHookLaunched === 0) {
      // 修改摆动范围为 45 度到 135 度
      this.hookAngle += this.hookSpeed
      if (this.hookAngle >= 135 || this.hookAngle <= 45) {
        this.hookSpeed = -this.hookSpeed
      }
    } else if (this.isHookLaunched === 1) {
      // 钩子伸长
      this.hookLength = Math.min(this.hookLength + 5, this.maxHookLength)
      if (this.hookLength >= this.maxHookLength) {
        this.isHookLaunched = 2
      }

      // 检测碰撞
      const hookEndX = hookStartX + this.hookLength * Math.cos(this.hookAngle * Math.PI / 180)
      const hookEndY = hookStartY + this.hookLength * Math.sin(this.hookAngle * Math.PI / 180)

      for (const obj of this.gameObjects) {
        if (obj.visible && Phaser.Geom.Intersects.RectangleToRectangle(
          new Phaser.Geom.Rectangle(hookEndX - 5, hookEndY - 5, 10, 10),
          obj.getBounds()
        )) {
          this.isHookLaunched = 2
          this.score += obj.getData('value')
          this.scoreText.setText(`分数: ${this.score}`)
          obj.setVisible(false)
          break
        }
      }
    } else if (this.isHookLaunched === 2) {
      // 钩子收回
      this.hookLength = Math.max(this.hookLength - 3, 40)
      if (this.hookLength <= 40) {
        this.isHookLaunched = 0
      }
    }

    // 更新钩子位置
    const hookEndX = hookStartX + this.hookLength * Math.cos(this.hookAngle * Math.PI / 180)
    const hookEndY = hookStartY + this.hookLength * Math.sin(this.hookAngle * Math.PI / 180)
    this.hook.setTo(0, 0, hookEndX - hookStartX, hookEndY - hookStartY)
    this.hookHead.setPosition(hookEndX, hookEndY)
  }
} 