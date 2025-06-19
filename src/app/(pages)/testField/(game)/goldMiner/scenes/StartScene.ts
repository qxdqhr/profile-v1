import * as Phaser from 'phaser'

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    // 添加标题
    this.add.text(width / 2, height / 4, '黄金矿工', {
      fontSize: '48px',
      color: '#FFD700'
    }).setOrigin(0.5)

    // 添加开始按钮
    const startButton = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()

    // 添加设置按钮
    const settingsButton = this.add.text(width / 2, height / 2 + 80, '游戏设置', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()

    // 添加按钮交互
    startButton.on('pointerdown', () => {
      this.scene.start('LevelSelectScene')
    })

    settingsButton.on('pointerdown', () => {
      this.scene.start('SettingsScene')
    })
  }
} 