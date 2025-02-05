import { Scene } from 'phaser';
import { STYLES } from '../const';

export class GameOverScene extends Scene {
    private finalScore: number = 0;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: { score: number }) {
        this.finalScore = data.score;
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // 创建半透明黑色背景
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);

        // 添加游戏结束文本
        this.add.text(centerX, centerY - 100, '游戏结束', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 添加得分文本
        this.add.text(centerX, centerY, `最终得分: ${this.finalScore}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 创建重新开始按钮
        const restartButton = this.add.rectangle(centerX, centerY + 80, 200, 50, 0x4CAF50);
        const restartText = this.add.text(centerX, centerY + 80, '重新开始', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 使按钮可交互
        restartButton.setInteractive();
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x45a049);
            this.input.setDefaultCursor('pointer');
        });
        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x4CAF50);
            this.input.setDefaultCursor('default');
        });
        restartButton.on('pointerdown', () => {
            restartButton.setFillStyle(0x3d8b40);
        });
        restartButton.on('pointerup', () => {
            this.restartGame();
        });
    }

    private restartGame() {
        // 重置光标
        this.input.setDefaultCursor('default');
        // 重启游戏场景
        this.scene.start('GameScene');
    }
} 