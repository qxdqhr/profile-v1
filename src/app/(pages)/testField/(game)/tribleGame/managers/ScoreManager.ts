import { Scene } from 'phaser';
import { GEMS_SCORES, STYLES } from '../const';

export class ScoreManager {
  private scene: Scene;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private comboCount: number = 0;
  private lastMatchTime: number = 0;
  private readonly COMBO_TIME_WINDOW = 1000; // 1秒内的消除算作连击

  constructor(scene: Scene) {
    this.scene = scene;
    this.initScoreDisplay();
  }

  private initScoreDisplay() {
    this.scoreText = this.scene.add.text(
      10, 10, 
      'Score: 0', 
      {
        fontSize: STYLES.SCORE.fontSize,
        color: '#000000'
      }
    );
    this.scoreText.setDepth(1);
  }

  public addScore(matchCount: number, isSpecial: boolean = false) {
    const now = Date.now();
        
    // 检查是否在连击时间窗口内
    if (now - this.lastMatchTime < this.COMBO_TIME_WINDOW) {
      this.comboCount++;
    } else {
      this.comboCount = 0;
    }
    this.lastMatchTime = now;

    // 计算基础分数
    let points = matchCount * (isSpecial ? GEMS_SCORES.SPECIAL : GEMS_SCORES.NORMAL);
        
    // 添加连击奖励
    if (this.comboCount > 0) {
      points += GEMS_SCORES.COMBO * this.comboCount;
    }

    this.score += points;
    this.updateScoreDisplay();

    // 显示得分动画
    this.showScorePopup(points);
  }

  private updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private showScorePopup(points: number) {
    const x = this.scoreText.x + 100;
    const y = this.scoreText.y;

    const pointsText = this.scene.add.text(x, y, `+${points}`, {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.scene.tweens.add({
      targets: pointsText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        pointsText.destroy();
      }
    });
  }

  public getScore(): number {
    return this.score;
  }

  public resetScore() {
    this.score = 0;
    this.comboCount = 0;
    this.updateScoreDisplay();
  }
} 