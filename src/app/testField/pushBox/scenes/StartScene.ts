import { LEVELS } from '../types'

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    this.load.image('startButton', '/pushbox/images/start-button.png')
    this.load.image('settingsButton', '/pushbox/images/settings-button.png')
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 添加标题
    const title = this.add.text(width / 2, height * 0.2, '推箱子', {
      fontSize: '48px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    // 添加开始按钮
    const startButton = this.add.text(width / 2, height * 0.4, '从头开始', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('GameScene', { level: 0 }))
    .on('pointerover', () => startButton.setTint(0x7878ff))
    .on('pointerout', () => startButton.clearTint())

    // 添加选关按钮
    const selectLevelButton = this.add.text(width / 2, height * 0.55, '选择关卡', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('LevelSelectScene'))
    .on('pointerover', () => selectLevelButton.setTint(0x7878ff))
    .on('pointerout', () => selectLevelButton.clearTint())

    // 添加设置按钮
    const settingsButton = this.add.text(width / 2, height * 0.7, '设置', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('SettingsScene'))
    .on('pointerover', () => settingsButton.setTint(0x7878ff))
    .on('pointerout', () => settingsButton.clearTint())
  }
} 