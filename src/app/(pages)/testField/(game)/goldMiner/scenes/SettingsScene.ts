import * as Phaser from 'phaser'

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    // 添加标题
    this.add.text(width / 2, height / 4, '游戏设置', {
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 音效设置
    const soundButton = this.add.text(width / 2, height / 2 - 40, '音效: 开', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()

    // 音乐设置
    const musicButton = this.add.text(width / 2, height / 2 + 40, '音乐: 开', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()

    // 返回按钮
    const backButton = this.add.text(width / 2, height * 0.8, '返回', {
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