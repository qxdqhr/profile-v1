import { STYLES, ASSETS } from '../const'

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // 加载宝石图片
    this.load.spritesheet(
      ASSETS.SPRITES.GEMS.key,
      ASSETS.SPRITES.GEMS.path,
      ASSETS.SPRITES.GEMS.frameConfig
    )

    // 加载UI元素
    this.load.image(ASSETS.IMAGES.BACKGROUND.key, ASSETS.IMAGES.BACKGROUND.path)
    this.load.image(ASSETS.IMAGES.BUTTON.key, ASSETS.IMAGES.BUTTON.path)
    
    // 加载音效
    this.load.audio(ASSETS.AUDIO.EFFECTS.SELECT.key, ASSETS.AUDIO.EFFECTS.SELECT.path)
    this.load.audio(ASSETS.AUDIO.EFFECTS.MATCH.key, ASSETS.AUDIO.EFFECTS.MATCH.path)
    this.load.audio(ASSETS.AUDIO.EFFECTS.SWAP.key, ASSETS.AUDIO.EFFECTS.SWAP.path)
    this.load.audio(ASSETS.AUDIO.BGM.key, ASSETS.AUDIO.BGM.path)

    // 添加加载进度条
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50)
    
    // 显示加载进度文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    
    // 进度条更新事件
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30)
    })
    
    // 加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
    })
  }

  create() {
    const { width, height } = this.cameras.main

    // 创建标题
    const title = this.add.text(width / 2, height / 4, '三消方块', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // 创建开始游戏按钮
    const startButton = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => startButton.setScale(1.1))
      .on('pointerout', () => startButton.setScale(1))
      .on('pointerdown', () => this.scene.start('LevelSelectScene'))

    // 创建设置按钮
    const settingsButton = this.add.text(width / 2, height / 2 + 80, '设置', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => settingsButton.setScale(1.1))
      .on('pointerout', () => settingsButton.setScale(1))
      .on('pointerdown', () => this.scene.start('SettingsScene'))
  }
}
