import { Scene } from 'phaser';
import { GAME_CONFIG, STYLES } from '../const';

export class TimeManager {
    private scene: Scene;
    private timeLeft: number;
    private progressBar!: Phaser.GameObjects.Graphics;
    private timeText!: Phaser.GameObjects.Text;
    private timer!: Phaser.Time.TimerEvent;
    private onTimeUp: () => void;

    constructor(scene: Scene, onTimeUp: () => void) {
        this.scene = scene;
        this.timeLeft = GAME_CONFIG.GAME_TIME;
        this.onTimeUp = onTimeUp;
        this.createProgressBar();
        this.startTimer();
    }

    private createProgressBar() {
        // 创建进度条背景
        this.progressBar = this.scene.add.graphics();
        
        // 创建时间文本
        this.timeText = this.scene.add.text(
            this.scene.scale.width / 2,
            50,
            this.formatTime(this.timeLeft),
            {
                fontSize: '32px',
                color: '#000000'
            }
        ).setOrigin(0.5);

        this.updateProgressBar();
    }

    private startTimer() {
        this.timer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    private updateTimer() {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
            this.timer.destroy();
            this.onTimeUp();
        }
        this.updateProgressBar();
    }

    private updateProgressBar() {
        const width = 400;
        const height = 20;
        const x = (this.scene.scale.width - width) / 2;
        const y = 20;
        const progress = this.timeLeft / GAME_CONFIG.GAME_TIME;

        this.progressBar.clear();

        // 绘制背景
        this.progressBar.fillStyle(0x666666);
        this.progressBar.fillRect(x, y, width, height);

        // 绘制进度
        const color = this.getProgressColor(progress);
        this.progressBar.fillStyle(color);
        this.progressBar.fillRect(x, y, width * progress, height);

        // 更新时间文本
        this.timeText.setText(this.formatTime(this.timeLeft));
    }

    private getProgressColor(progress: number): number {
        if (progress > 0.6) return 0x00ff00;  // 绿色
        if (progress > 0.3) return 0xffff00;  // 黄色
        return 0xff0000;  // 红色
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    public addTime(seconds: number) {
        this.timeLeft = Math.min(this.timeLeft + seconds, GAME_CONFIG.GAME_TIME);
        this.updateProgressBar();
    }

    public destroy() {
        if (this.timer) this.timer.destroy();
        this.progressBar.destroy();
        this.timeText.destroy();
    }
} 
