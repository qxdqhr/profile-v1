import { STYLES } from '../types'

export class SettingsScene extends Phaser.Scene {
  private isMobile: boolean

  constructor() {
    super({ key: 'SettingsScene' })
    this.isMobile = window.innerWidth < 768
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 设置背景颜色
    this.cameras.main.setBackgroundColor(STYLES.background.settings)

    const fontSize = this.isMobile ? STYLES.responsive.mobile.fontSize : STYLES.responsive.desktop.fontSize
    const padding = this.isMobile ? STYLES.responsive.mobile.padding : STYLES.responsive.desktop.padding
    const scale = this.isMobile ? STYLES.responsive.mobile.scale : STYLES.responsive.desktop.scale

    // 添加标题
    const title = this.add.text(width / 2, height * (this.isMobile ? 0.15 : 0.2), '设置', {
      ...STYLES.title,
      fontSize: fontSize.title,
      padding: { x: padding.button.x * 1.5, y: padding.button.y * 1.5 }
    })
      .setOrigin(0.5)
      .setShadow(2, 2, '#2d2d2d', 8, true)

    // 创建设置选项容器
    const settingsContainer = this.add.container(width / 2, height * (this.isMobile ? 0.35 : 0.4))

    // 添加音效设置
    const soundButton = this.add.text(0, 0, '音效: 开', {
      ...STYLES.button,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        soundButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        soundButton.setTint(STYLES.button.hover.tint)
        soundButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        soundButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        soundButton.clearTint()
        soundButton.setScale(1)
      })

    // 添加音乐设置
    const musicButton = this.add.text(0, this.isMobile ? 60 : 80, '音乐: 开', {
      ...STYLES.button,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        musicButton.setStyle({ backgroundColor: STYLES.button.hover.backgroundColor })
        musicButton.setTint(STYLES.button.hover.tint)
        musicButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        musicButton.setStyle({ backgroundColor: STYLES.button.backgroundColor })
        musicButton.clearTint()
        musicButton.setScale(1)
      })

    // 添加返回按钮
    const backButton = this.add.text(0, this.isMobile ? 120 : 160, '返回', {
      ...STYLES.backButton,
      fontSize: fontSize.button,
      padding: { x: padding.button.x, y: padding.button.y }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        backButton.setStyle({ backgroundColor: STYLES.backButton.hover.backgroundColor })
        backButton.setTint(STYLES.backButton.hover.tint)
        backButton.setScale(scale.button)
      })
      .on('pointerout', () => {
        backButton.setStyle({ backgroundColor: STYLES.backButton.backgroundColor })
        backButton.clearTint()
        backButton.setScale(1)
      })
      .on('pointerdown', () => this.scene.start('StartScene'))

    // 将所有元素添加到容器
    settingsContainer.add([soundButton, musicButton, backButton])

    // 添加提示文本
    this.add.text(width / 2, height * (this.isMobile ? 0.75 : 0.8), '点击选项切换设置', {
      ...STYLES.hint,
      fontSize: fontSize.text
    }).setOrigin(0.5)
  }
} 