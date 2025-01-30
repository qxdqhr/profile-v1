import { LEVELS, STYLES } from '../types'

export class StartScene extends Phaser.Scene {
  private isMobile: boolean

  constructor() {
    super({ key: 'StartScene' })
    this.isMobile = window.innerWidth < 768
  }

  preload() {
    this.load.image('startButton', '/pushbox/images/start-button.png')
    this.load.image('settingsButton', '/pushbox/images/settings-button.png')
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 设置背景颜色
    this.cameras.main.setBackgroundColor(STYLES.background.menu)

    const fontSize = this.isMobile ? STYLES.responsive.mobile.fontSize : STYLES.responsive.desktop.fontSize
    const padding = this.isMobile ? STYLES.responsive.mobile.padding : STYLES.responsive.desktop.padding
    const scale = this.isMobile ? STYLES.responsive.mobile.scale : STYLES.responsive.desktop.scale

    // 添加标题
    const title = this.add.text(width / 2, height * (this.isMobile ? 0.15 : 0.2), '推箱子', {
      ...STYLES.title,
      fontSize: fontSize.title,
      padding: { x: padding.button.x * 1.5, y: padding.button.y * 1.5 }
    })
      .setOrigin(0.5)
      .setShadow(2, 2, '#2d2d2d', 8, true)

    // 创建按钮容器
    const buttonContainer = this.add.container(width / 2, height * (this.isMobile ? 0.35 : 0.4))

    // 添加开始按钮
    const startButton = this.add.text(0, 0, '从头开始', {
      ...STYLES.button,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        startButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        startButton.setTint(STYLES.button.hover.tint)
        startButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        startButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        startButton.clearTint()
        startButton.setScale(1)
      })
      .on('pointerdown', () => this.scene.start('GameScene', { level: 0 }))

    // 添加选关按钮
    const selectLevelButton = this.add.text(0, this.isMobile ? 60 : 80, '选择关卡', {
      ...STYLES.button,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        selectLevelButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        selectLevelButton.setTint(STYLES.button.hover.tint)
        selectLevelButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        selectLevelButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        selectLevelButton.clearTint()
        selectLevelButton.setScale(1)
      })
      .on('pointerdown', () => this.scene.start('LevelSelectScene'))

    // 添加设置按钮
    const settingsButton = this.add.text(0, this.isMobile ? 120 : 160, '设置', {
      ...STYLES.button,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        settingsButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        settingsButton.setTint(STYLES.button.hover.tint)
        settingsButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        settingsButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        settingsButton.clearTint()
        settingsButton.setScale(1)
      })
      .on('pointerdown', () => this.scene.start('SettingsScene'))

    // 将按钮添加到容器
    buttonContainer.add([startButton, selectLevelButton, settingsButton])

    // 添加版本号
    this.add.text(width - (this.isMobile ? 5 : 10), height - (this.isMobile ? 5 : 10), 'v1.0.0', {
      ...STYLES.hint,
      fontSize: fontSize.text
    }).setOrigin(1, 1)
  }
} 