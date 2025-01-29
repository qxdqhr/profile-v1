import { LEVELS } from '../types'

export class LevelSelectScene extends Phaser.Scene {
  private currentPage: number = 0
  private levelsPerPage: number = 20
  private buttonsContainer!: Phaser.GameObjects.Container
  private pageText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const padding = 20

    // 添加标题
    const title = this.add.text(width / 2, height * 0.1, '选择关卡', {
      fontSize: '48px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5)

    // 创建关卡按钮容器
    this.buttonsContainer = this.add.container(0, 0)

    // 添加左右翻页按钮
    const prevButton = this.add.container(padding + 30, height * 0.45)
    const prevBg = this.add.rectangle(0, 0, 40, 80, 0x444444).setInteractive()
    const prevText = this.add.text(0, 0, '←', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)
    prevButton.add([prevBg, prevText])

    const nextButton = this.add.container(width - padding - 30, height * 0.45)
    const nextBg = this.add.rectangle(0, 0, 40, 80, 0x444444).setInteractive()
    const nextText = this.add.text(0, 0, '→', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)
    nextButton.add([nextBg, nextText])

    // 添加页码显示
    this.pageText = this.add.text(width / 2, height * 0.85, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)

    // 设置按钮交互
    prevBg.on('pointerover', () => {
      prevBg.setFillStyle(0x666666)
      prevText.setTint(0x7878ff)
    }).on('pointerout', () => {
      prevBg.setFillStyle(0x444444)
      prevText.clearTint()
    }).on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.currentPage--
        this.showCurrentPage()
      }
    })

    nextBg.on('pointerover', () => {
      nextBg.setFillStyle(0x666666)
      nextText.setTint(0x7878ff)
    }).on('pointerout', () => {
      nextBg.setFillStyle(0x444444)
      nextText.clearTint()
    }).on('pointerdown', () => {
      if ((this.currentPage + 1) * this.levelsPerPage < LEVELS.length) {
        this.currentPage++
        this.showCurrentPage()
      }
    })

    // 添加返回按钮
    const backButton = this.add.rectangle(width / 2, height * 0.92, 160, 50, 0x444444)
    const backText = this.add.text(width / 2, height * 0.92, '返回主菜单', {
      fontSize: '28px',
      color: '#ffffff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    backButton.setInteractive()
      .on('pointerover', () => {
        backButton.setFillStyle(0x666666)
        backText.setTint(0x7878ff)
      })
      .on('pointerout', () => {
        backButton.setFillStyle(0x444444)
        backText.clearTint()
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
    const padding = 20

    // 设置网格布局
    const buttonWidth = 100
    const buttonHeight = 50
    const buttonSpacing = 20
    const buttonsPerRow = 5
    const rows = 3
    const totalWidth = buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * buttonSpacing
    const startX = (width - totalWidth) / 2
    const startY = height * 0.25

    // 计算当前页的关卡范围
    const startIndex = this.currentPage * this.levelsPerPage
    const endIndex = Math.min(startIndex + this.levelsPerPage, LEVELS.length)

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
      const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x444444)
        .setInteractive()
        .on('pointerover', () => {
          buttonBg.setFillStyle(0x666666)
          levelText.setTint(0x7878ff)
        })
        .on('pointerout', () => {
          buttonBg.setFillStyle(0x444444)
          levelText.clearTint()
        })
        .on('pointerdown', () => this.scene.start('GameScene', { level: i }))
      buttonGroup.add(buttonBg)

      // 创建关卡文本
      const levelText = this.add.text(0, -10, `第 ${i + 1} 关`, {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5)
      buttonGroup.add(levelText)

      // 添加小星星图标
      const star = this.add.text(0, 10, '★', {
        fontSize: '16px',
        color: '#FFD700'
      }).setOrigin(0.5)
      buttonGroup.add(star)
    }

    // 更新页码显示
    const totalPages = Math.ceil(LEVELS.length / this.levelsPerPage)
    this.pageText.setText(`${this.currentPage + 1} / ${totalPages}`)
  }
} 