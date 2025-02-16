export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  create() {
    const { width, height } = this.cameras.main
    const levels = 9 // 总关卡数

    // 添加标题
    this.add.text(width / 2, 50, '选择关卡', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // 创建关卡选择网格
    const startX = width / 2 - 150
    const startY = height / 2 - 100

    for (let i = 0; i < levels; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      const levelButton = this.add.text(
        startX + col * 150,
        startY + row * 150,
        `第 ${i + 1} 关`,
        {
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#FF9800',
          padding: { x: 20, y: 10 }
        }
      )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => levelButton.setScale(1.1))
        .on('pointerout', () => levelButton.setScale(1))
        .on('pointerdown', () => {
          this.scene.start('GameScene', { level: i + 1 })
        })
    }

    // 返回按钮
    const backButton = this.add.text(100, 50, '返回', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#f44336',
      padding: { x: 15, y: 8 }
    })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('StartScene'))
  }
}
