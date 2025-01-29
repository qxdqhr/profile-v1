export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' })
  }

  create() {
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // 添加标题
    this.add.text(centerX, 100, '设置', {
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 添加音效设置
    this.add.text(centerX, centerY - 50, '音效: 开', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 添加音乐设置
    this.add.text(centerX, centerY + 50, '音乐: 开', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 添加返回按钮
    const backButton = this.add.text(centerX, centerY + 150, '返回', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('StartScene'))
    .on('pointerover', () => backButton.setTint(0x7878ff))
    .on('pointerout', () => backButton.clearTint())
  }
} 