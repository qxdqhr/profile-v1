import * as Phaser from 'phaser'

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    this.add.text(width / 2, height / 6, '选择关卡', {
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 创建关卡选择网格
    const levels = 12
    const columns = 4
    const buttonWidth = 100
    const buttonHeight = 100
    const padding = 20

    for (let i = 0; i < levels; i++) {
      const row = Math.floor(i / columns)
      const col = i % columns
      
      const x = width / 2 + (col - columns / 2 + 0.5) * (buttonWidth + padding)
      const y = height / 2 + (row - 1) * (buttonHeight + padding)

      const levelButton = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x4a4a4a)
        .setInteractive()

      this.add.text(x, y, `${i + 1}`, {
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5)

      levelButton.on('pointerdown', () => {
        this.scene.start('GameScene', { level: i + 1 })
      })
    }

    // 返回按钮
    const backButton = this.add.text(width / 2, height * 0.9, '返回', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()

    backButton.on('pointerdown', () => {
      this.scene.start('StartScene')
    })
  }
} 