
export class SettingsScene extends Phaser.Scene {
  private isMobile: boolean

  constructor() {
    super({ key: 'SettingsScene' })
    this.isMobile = window.innerWidth < 768
  }

  create() {
  }
} 