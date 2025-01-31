import { Scene } from 'phaser';
import { ASSETS } from '../const';
import { ScoreManager } from '../managers/ScoreManager';
import { GemManager } from '../managers/GemManager';
import { TimeManager } from '../managers/TimeManager';

export class GameScene extends Scene {
    private scoreManager!: ScoreManager;
    private gemManager!: GemManager;
    private timeManager!: TimeManager;
    private isGameOver: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('gem', ASSETS.SPRITES.GEMS.path);
    }

    create() {
        // 重置游戏状态
        this.isGameOver = false;
        
        // 设置白色背景
        this.cameras.main.setBackgroundColor('#FFFFFF');
        
        // 初始化管理器
        this.scoreManager = new ScoreManager(this);
        this.gemManager = new GemManager(this, this.scoreManager);
        this.timeManager = new TimeManager(this, this.onTimeUp.bind(this));

        // 设置点击事件
        this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: any) => {
            if (!this.isGameOver && 'gemType' in gameObject) {
                this.gemManager.handleGemClick(gameObject);
            }
        });
    }

    private onTimeUp() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // 停止所有游戏逻辑
        this.gemManager.disableInteraction();
        
        // 显示游戏结束场景
        this.scene.launch('GameOverScene', { score: this.scoreManager.getScore() });
    }

    public destroy() {
        this.timeManager.destroy();
    }
}
