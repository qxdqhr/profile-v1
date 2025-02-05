import { LEVELS, STYLES } from '../types'

export class LevelSelectScene extends Phaser.Scene {
  private currentPage: number = 0
  private levelsPerPage: number
  private buttonsContainer!: Phaser.GameObjects.Container
  private pageText!: Phaser.GameObjects.Text
  private isMobile: boolean

  constructor() {
    super({ key: 'LevelSelectScene' })
    this.isMobile = window.innerWidth < 768
    this.levelsPerPage = this.isMobile ? 12 : 15 // 移动端每页显示更少关卡
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const padding = this.isMobile ? STYLES.responsive.mobile.padding.container : STYLES.responsive.desktop.padding.container

    // 设置背景颜色
    this.cameras.main.setBackgroundColor(STYLES.background.menu)

    const fontSize = this.isMobile ? STYLES.responsive.mobile.fontSize : STYLES.responsive.desktop.fontSize
    const buttonPadding = this.isMobile ? STYLES.responsive.mobile.padding.button : STYLES.responsive.desktop.padding.button
    const scale = this.isMobile ? STYLES.responsive.mobile.scale : STYLES.responsive.desktop.scale

    // 添加标题
    const title = this.add.text(width / 2, height * (this.isMobile ? 0.1 : 0.1), '选择关卡', {
      ...STYLES.title,
      fontSize: fontSize.title,
      padding: { x: buttonPadding.x * 1.5, y: buttonPadding.y * 1.5 }
    })
      .setOrigin(0.5)
      .setShadow(2, 2, '#2d2d2d', 8, true)

    // 创建关卡按钮容器
    this.buttonsContainer = this.add.container(0, 0)

    // 设置按钮尺寸
    const buttonWidth = this.isMobile ? 100 : STYLES.levelButton.width
    const buttonHeight = this.isMobile ? 100 : STYLES.levelButton.height
    const buttonSpacing = this.isMobile ? 10 : 20
    const buttonsPerRow = this.isMobile ? 3 : 5
    const rows = this.isMobile ? 4 : 3

    // 添加左右翻页按钮
    const prevButton = this.add.container(padding + 30, height * 0.45)
    const prevBg = this.add.rectangle(0, 0, 
      this.isMobile ? 30 : STYLES.arrowButton.width,
      this.isMobile ? 60 : STYLES.arrowButton.height,
      Number('0x' + STYLES.arrowButton.backgroundColor.slice(1)))
      .setInteractive()
    const prevText = this.add.text(0, 0, '←', {
      fontSize: this.isMobile ? '24px' : STYLES.arrowButton.fontSize,
      color: STYLES.arrowButton.color
    }).setOrigin(0.5)
    prevButton.add([prevBg, prevText])

    const nextButton = this.add.container(width - padding - 30, height * 0.45)
    const nextBg = this.add.rectangle(0, 0,
      this.isMobile ? 30 : STYLES.arrowButton.width,
      this.isMobile ? 60 : STYLES.arrowButton.height,
      Number('0x' + STYLES.arrowButton.backgroundColor.slice(1)))
      .setInteractive()
    const nextText = this.add.text(0, 0, '→', {
      fontSize: this.isMobile ? '24px' : STYLES.arrowButton.fontSize,
      color: STYLES.arrowButton.color
    }).setOrigin(0.5)
    nextButton.add([nextBg, nextText])

    // 添加页码显示
    this.pageText = this.add.text(width / 2, height * 0.85, '', {
      ...STYLES.pageNumber,
      fontSize: fontSize.text
    }).setOrigin(0.5)

    // 设置按钮交互
    prevBg.on('pointerover', () => {
      prevBg.setFillStyle(Number('0x' + STYLES.arrowButton.hover.backgroundColor.slice(1)))
      prevText.setTint(STYLES.arrowButton.hover.tint)
      prevButton.setScale(scale.button)
    }).on('pointerout', () => {
      prevBg.setFillStyle(Number('0x' + STYLES.arrowButton.backgroundColor.slice(1)))
      prevText.clearTint()
      prevButton.setScale(1)
    }).on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.currentPage--
        this.showCurrentPage()
      }
    })

    nextBg.on('pointerover', () => {
      nextBg.setFillStyle(Number('0x' + STYLES.arrowButton.hover.backgroundColor.slice(1)))
      nextText.setTint(STYLES.arrowButton.hover.tint)
      nextButton.setScale(scale.button)
    }).on('pointerout', () => {
      nextBg.setFillStyle(Number('0x' + STYLES.arrowButton.backgroundColor.slice(1)))
      nextText.clearTint()
      nextButton.setScale(1)
    }).on('pointerdown', () => {
      if ((this.currentPage + 1) * this.levelsPerPage < LEVELS.length) {
        this.currentPage++
        this.showCurrentPage()
      }
    })

    // 添加返回按钮
    const backButton = this.add.text(width / 2, height * 0.92, '返回主菜单', {
      ...STYLES.backButton,
      fontSize: fontSize.button,
      padding: { x: buttonPadding.x, y: buttonPadding.y }
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

    // 显示第一页
    this.showCurrentPage()
  }

  private showCurrentPage() {
    // 清除当前按钮
    this.buttonsContainer.removeAll(true)

    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const padding = this.isMobile ? STYLES.responsive.mobile.padding.container : STYLES.responsive.desktop.padding.container

    // 设置网格布局
    const buttonWidth = this.isMobile ? 100 : STYLES.levelButton.width
    const buttonHeight = this.isMobile ? 100 : STYLES.levelButton.height
    const buttonSpacing = this.isMobile ? 10 : 20
    const buttonsPerRow = this.isMobile ? 3 : 5
    const totalWidth = buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * buttonSpacing
    const startX = (width - totalWidth) / 2
    const startY = height * (this.isMobile ? 0.2 : 0.25)

    // 计算当前页的关卡范围
    const startIndex = this.currentPage * this.levelsPerPage
    const endIndex = Math.min(startIndex + this.levelsPerPage, LEVELS.length)

    const fontSize = this.isMobile ? STYLES.responsive.mobile.fontSize : STYLES.responsive.desktop.fontSize
    const scale = this.isMobile ? STYLES.responsive.mobile.scale : STYLES.responsive.desktop.scale

    // 创建当前页的按钮
    for (let i = startIndex; i < endIndex; i++) {
      const row = Math.floor((i - startIndex) / buttonsPerRow)
      const col = (i - startIndex) % buttonsPerRow
      const x = startX + col * (buttonWidth + buttonSpacing) + buttonWidth/2
      const y = startY + row * (buttonHeight + buttonSpacing)

      // 创建按钮组
      const buttonGroup = this.add.container(x, y)
      this.buttonsContainer.add(buttonGroup)

      // 创建按钮背景
      const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight,
        Number('0x' + STYLES.levelButton.backgroundColor.slice(1)))
        .setInteractive()
        .on('pointerover', () => {
          buttonBg.setFillStyle(Number('0x' + STYLES.levelButton.hover.backgroundColor.slice(1)))
          levelText.setTint(STYLES.levelButton.hover.tint)
          buttonGroup.setScale(scale.levelButton)
        })
        .on('pointerout', () => {
          buttonBg.setFillStyle(Number('0x' + STYLES.levelButton.backgroundColor.slice(1)))
          levelText.clearTint()
          buttonGroup.setScale(1)
        })
        .on('pointerdown', () => this.scene.start('GameScene', { level: i }))
      buttonGroup.add(buttonBg)

      // 创建关卡文本
      const levelText = this.add.text(0, this.isMobile ? -8 : -10, `第 ${i + 1} 关`, {
        fontSize: this.isMobile ? '20px' : STYLES.levelButton.fontSize,
        color: STYLES.levelButton.color,
        align: 'center'
      }).setOrigin(0.5)
      buttonGroup.add(levelText)

      // 添加小星星图标
      const star = this.add.text(0, this.isMobile ? 8 : 10, '★', {
        fontSize: this.isMobile ? '14px' : '16px',
        color: '#FFD700'
      }).setOrigin(0.5)
      buttonGroup.add(star)
    }

    // 更新页码显示
    const totalPages = Math.ceil(LEVELS.length / this.levelsPerPage)
    this.pageText.setText(`${this.currentPage + 1} / ${totalPages}`)
  }
} 