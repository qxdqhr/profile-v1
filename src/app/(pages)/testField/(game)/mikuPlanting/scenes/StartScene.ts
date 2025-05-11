export class StartScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private settingsButton!: Phaser.GameObjects.Image;
  private creditsButton!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    this.load.setBaseURL('../src/app/gameField/mikuPlanting/images/');
    // 使用相对路径加载资源
    this.load.image('background', 'background.png');
    this.load.image('settingsButton', 'settings_button.png');
    this.load.image('creditsButton', 'credits_button.png');
  }

  create() {
    // 添加背景图
    this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    
    // 调整背景图大小以适应屏幕
    const scaleX = this.cameras.main.width / this.background.width;
    const scaleY = this.cameras.main.height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);
    
    // 使背景图可点击
    this.background.setInteractive();
    this.background.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
    // 添加设置按钮
    this.settingsButton = this.add.image(
      this.cameras.main.width - 50, 
      50, 
      'settingsButton'
    ).setScale(0.5);
    
    this.settingsButton.setInteractive();
    this.settingsButton.on('pointerdown', () => {
      this.scene.start('SettingsScene');
    });
    
    // 添加感谢名单按钮
    this.creditsButton = this.add.image(
      this.cameras.main.width - 50, 
      120, 
      'creditsButton'
    ).setScale(0.5);
    
    this.creditsButton.setInteractive();
    this.creditsButton.on('pointerdown', () => {
      this.scene.start('CreditScene');
    });
    
    // 添加游戏标题
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 4,
      '初音种植园',
      {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // 添加开始游戏提示
    const startText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.8,
      '点击屏幕开始游戏',
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // 添加闪烁动画
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }
} 