import { STYLES, AUDIO, STORAGE_KEY } from '../const'

export class SettingsScene extends Phaser.Scene {
  private settings: {
    music: boolean;
    sound: boolean;
    difficulty: string;
  }
  private bgMusic!: Phaser.Sound.BaseSound

  constructor() {
    super({ key: 'SettingsScene' })
    this.settings = {
      music: true,
      sound: true,
      difficulty: 'normal'
    }
  }

  create() {
    const { width, height } = this.cameras.main

    // 获取或创建背景音乐
    this.bgMusic = this.sound.get(AUDIO.BGM.key) || 
      this.sound.add(AUDIO.BGM.key, { 
        loop: AUDIO.BGM.loop, 
        volume: AUDIO.BGM.volume 
      })

    // 标题
    this.add.text(width / 2, 50, '游戏设置', STYLES.TITLE).setOrigin(0.5)

    // 音乐开关
    const musicText = this.add.text(width / 2 - 100, height / 2 - 80, '音乐:', STYLES.BUTTON)

    const musicToggle = this.add.text(
      width / 2 + 50, 
      height / 2 - 80, 
      this.settings.music ? '开' : '关',
      {
        ...STYLES.BUTTON,
        color: this.settings.music ? STYLES.SETTINGS.ON_COLOR : STYLES.SETTINGS.OFF_COLOR,
        backgroundColor: STYLES.SETTINGS.BG_COLOR
      }
    )
    .setInteractive()
    .on('pointerdown', () => {
      this.settings.music = !this.settings.music
      musicToggle.setText(this.settings.music ? '开' : '关')
      musicToggle.setColor(this.settings.music ? STYLES.SETTINGS.ON_COLOR : STYLES.SETTINGS.OFF_COLOR)
      
      if (this.settings.music) {
        if (!this.bgMusic.isPlaying) {
          this.bgMusic.play()
        }
      } else {
        this.bgMusic.stop()
      }

      this.saveSettings()
    })

    // 音效开关
    const soundText = this.add.text(width / 2 - 100, height / 2, '音效:', STYLES.BUTTON)

    const soundToggle = this.add.text(
      width / 2 + 50, 
      height / 2,
      this.settings.sound ? '开' : '关',
      {
        ...STYLES.BUTTON,
        color: this.settings.sound ? STYLES.SETTINGS.ON_COLOR : STYLES.SETTINGS.OFF_COLOR,
        backgroundColor: STYLES.SETTINGS.BG_COLOR
      }
    )
    .setInteractive()
    .on('pointerdown', () => {
      this.settings.sound = !this.settings.sound
      soundToggle.setText(this.settings.sound ? '开' : '关')
      soundToggle.setColor(this.settings.sound ? STYLES.SETTINGS.ON_COLOR : STYLES.SETTINGS.OFF_COLOR)

      this.sound.getAllPlaying().forEach(sound => {
        if (sound.key !== AUDIO.BGM.key) {
          (sound as Phaser.Sound.WebAudioSound).volume = this.settings.sound ? 1 : 0
        }
      })

      this.saveSettings()
    })

    // 返回按钮
    const backButton = this.add.text(100, 50, '返回', STYLES.BUTTON)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('StartScene'))

    this.loadSettings()
  }

  private saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
  }

  private loadSettings() {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings)
      
      if (this.settings.music) {
        if (!this.bgMusic.isPlaying) {
          this.bgMusic.play()
        }
      } else {
        this.bgMusic.stop()
      }

      this.sound.getAllPlaying().forEach(sound => {
        if (sound.key !== AUDIO.BGM.key) {
          (sound as Phaser.Sound.WebAudioSound).volume = this.settings.sound ? 1 : 0
        }
      })
    }
  }
}
