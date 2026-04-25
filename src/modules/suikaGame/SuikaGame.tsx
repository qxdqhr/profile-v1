// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   11 级球体定义（尺寸为 360px 宽时的基准值）
───────────────────────────────────────────── */
const BASE_LEVELS = [
  { radius: 18,  color: 0xFF6B6B, score: 1   },  // Lv1 · 红
  { radius: 25,  color: 0xFF9B3E, score: 3   },  // Lv2 · 橙
  { radius: 34,  color: 0xFFD23F, score: 6   },  // Lv3 · 黄
  { radius: 44,  color: 0x7ED957, score: 10  },  // Lv4 · 浅绿
  { radius: 56,  color: 0x00BFA5, score: 15  },  // Lv5 · 青
  { radius: 70,  color: 0x29B6F6, score: 21  },  // Lv6 · 蓝
  { radius: 85,  color: 0x7C4DFF, score: 28  },  // Lv7 · 紫
  { radius: 100, color: 0xFF80AB, score: 36  },  // Lv8 · 粉
  { radius: 118, color: 0xFF5722, score: 45  },  // Lv9 · 橙红
  { radius: 138, color: 0xE91E63, score: 55  },  // Lv10 · 深红
  { radius: 160, color: 0x43A047, score: 100 },  // Lv11 · 绿★ MAX
];

const BASE_GAME_W = 360;
const BASE_GAME_H = 640;
const MAX_LV = BASE_LEVELS.length - 1;
const DROP_POOL = [0, 1, 2, 3, 4];       // 投放范围只限前 5 级
const WALL_T = 10;                         // 墙体基础厚度（会缩放）
const DROP_DELAY_MS = 650;               // 投放后等待下一球的时间
const DANGER_THRESHOLD_MS = 2500;        // 球在危险线上方静止多久触发 game over
const MERGE_DELAY_MS = 80;              // 合并延迟
const GRAVITY = 2.5;

function getLevels(scale: number) {
  return BASE_LEVELS.map((lv) => ({
    ...lv,
    radius: Math.max(8, Math.round(lv.radius * scale)),
  }));
}

/* ─────────────────────────────────────────────
   主组件
───────────────────────────────────────────── */
export function SuikaGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let PhaserLib: any = null;
    let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: ResizeObserver | null = null;

    /* ── 构建一个游戏实例 ─────────────────── */
    const buildGame = () => {
      if (!mounted || !PhaserLib || !containerRef.current || !hostRef.current) return;

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
      hostRef.current.innerHTML = '';

      const Phaser = PhaserLib;
      const cW = containerRef.current.clientWidth;
      const cH = containerRef.current.clientHeight;
      if (cW < 80 || cH < 80) return;

      /* 等比缩放，保持容器比例 */
      const scale = Math.min(cW / BASE_GAME_W, cH / BASE_GAME_H, 1.8);
      const gameW = Math.round(BASE_GAME_W * scale);
      const gameH = Math.round(BASE_GAME_H * scale);
      const LEVELS = getLevels(scale);
      const wt = Math.max(6, Math.round(WALL_T * scale));
      const dropY = Math.round(75 * scale);      // 投球起始 Y
      const dangerY = Math.round(115 * scale);   // 危险线 Y

      /* ── Phaser 场景 ───────────────────── */
      class SuikaScene extends Phaser.Scene {
        status: 'playing' | 'over' = 'playing';
        score = 0;
        highScore = 0;
        currentLv = 0;
        nextLv = 0;
        dropperX = gameW / 2;
        dropLock = false;

        dropper: any = null;
        nextImg: any = null;
        lineGfx: any = null;
        dangerGfx: any = null;
        hudText: any = null;
        highText: any = null;
        overlayGroup: any = null;
        balls: Set<any> = new Set();

        constructor() { super({ key: 'SuikaScene' }); }

        /* ── preload：生成球体贴图 ──────── */
        preload() {
          LEVELS.forEach((lv, i) => {
            const r = lv.radius;
            const size = r * 2;
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });

            // 底色
            gfx.fillStyle(lv.color, 1);
            gfx.fillCircle(r, r, r);

            // 内阴影（底部较暗）
            gfx.fillStyle(0x000000, 0.18);
            gfx.fillCircle(r + r * 0.08, r + r * 0.12, r * 0.82);

            // 高光
            gfx.fillStyle(0xffffff, 0.32);
            gfx.fillCircle(r - r * 0.26, r - r * 0.3, r * 0.38);
            gfx.fillStyle(0xffffff, 0.14);
            gfx.fillCircle(r - r * 0.12, r - r * 0.14, r * 0.18);

            // 描边
            gfx.lineStyle(Math.max(1, r * 0.05), 0x000000, 0.2);
            gfx.strokeCircle(r, r, r - 1);

            const rt = this.add.renderTexture(0, 0, size, size);
            rt.draw(gfx, 0, 0);
            rt.saveTexture(`ball_${i}`);
            rt.destroy();
            gfx.destroy();
          });
        }

        /* ── create ─────────────────────── */
        create() {
          this.highScore = parseInt(
            (typeof localStorage !== 'undefined' && localStorage.getItem('suika-hs')) || '0'
          );

          /* 背景 */
          this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x1a1a2e).setDepth(0);

          /* 容器视觉（木桶感） */
          const bg = this.add.graphics().setDepth(1);
          // 内部区域
          bg.fillStyle(0x12122a, 1);
          bg.fillRect(wt, dangerY - 2, gameW - wt * 2, gameH - dangerY - wt + 2);
          // 左墙
          bg.fillStyle(0x3d2f6e, 1);
          bg.fillRect(0, 0, wt, gameH);
          bg.fillStyle(0x5a4490, 1);
          bg.fillRect(0, 0, 3, gameH);
          // 右墙
          bg.fillStyle(0x3d2f6e, 1);
          bg.fillRect(gameW - wt, 0, wt, gameH);
          bg.fillStyle(0x5a4490, 1);
          bg.fillRect(gameW - wt - 1, 0, 2, gameH);
          // 底部
          bg.fillStyle(0x3d2f6e, 1);
          bg.fillRect(wt, gameH - wt, gameW - wt * 2, wt);
          bg.fillStyle(0x5a4490, 1);
          bg.fillRect(wt, gameH - wt, gameW - wt * 2, 2);

          /* 危险线 */
          this.dangerGfx = this.add.graphics().setDepth(3);

          /* 投放指示线 */
          this.lineGfx = this.add.graphics().setDepth(14);

          /* 物理墙壁（静态） */
          const wallOpts = { isStatic: true, friction: 0.4, restitution: 0.1, label: 'wall' };
          this.matter.add.rectangle(wt / 2, gameH / 2, wt, gameH, wallOpts);
          this.matter.add.rectangle(gameW - wt / 2, gameH / 2, wt, gameH, wallOpts);
          this.matter.add.rectangle(gameW / 2, gameH - wt / 2, gameW, wt, wallOpts);

          /* 初始化级别 */
          this.currentLv = Phaser.Math.RND.pick(DROP_POOL);
          this.nextLv = Phaser.Math.RND.pick(DROP_POOL);

          /* 投球预览图 */
          this.dropper = this.add.image(gameW / 2, dropY, `ball_${this.currentLv}`)
            .setDepth(15).setAlpha(0.9);

          /* 下一球预览 */
          const nextR = LEVELS[this.nextLv].radius;
          this.nextImg = this.add.image(
            gameW - wt - 4 - nextR * 0.8,
            dropY - nextR * 0.4,
            `ball_${this.nextLv}`
          ).setDepth(15).setScale(0.75).setAlpha(0.8);

          const nextLabel = this.add.text(gameW - wt - 4, 8, 'NEXT', {
            color: '#aaaacc', fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 2,
          }).setOrigin(1, 0).setDepth(20);

          /* HUD */
          this.hudText = this.add.text(wt + 6, 8, `得分: 0`, {
            color: '#ffffff', fontSize: `${Math.max(11, Math.round(13 * scale))}px`,
            fontFamily: '"Source Han Sans", sans-serif', stroke: '#000', strokeThickness: 3,
          }).setDepth(20);

          this.highText = this.add.text(wt + 6, 8 + Math.round(16 * scale), `最高: ${this.highScore}`, {
            color: '#ffd54f', fontSize: `${Math.max(9, Math.round(11 * scale))}px`,
            fontFamily: '"Source Han Sans", sans-serif', stroke: '#000', strokeThickness: 2,
          }).setDepth(20);

          /* 覆盖层容器（game over） */
          this.overlayGroup = this.add.group();

          /* 输入 */
          this.input.on('pointermove', (ptr: any) => {
            if (this.dropLock || this.status !== 'playing') return;
            const r = LEVELS[this.currentLv].radius;
            this.dropperX = Phaser.Math.Clamp(ptr.x, wt + r + 1, gameW - wt - r - 1);
            this.dropper.setX(this.dropperX);
          });

          this.input.on('pointerdown', (ptr: any) => {
            if (this.status === 'over') { this.restartGame(); return; }
            if (this.dropLock) return;
            // 点击任意位置更新落点后立即投放
            const r = LEVELS[this.currentLv].radius;
            this.dropperX = Phaser.Math.Clamp(ptr.x, wt + r + 1, gameW - wt - r - 1);
            this.dropper.setX(this.dropperX);
            this.drop();
          });

          /* 碰撞事件 */
          this.matter.world.on('collisionstart', (event: any) => {
            for (const pair of event.pairs) {
              this.tryMerge(pair.bodyA, pair.bodyB);
            }
          });

          this.events.on('external-restart', () => this.restartGame());
        }

        /* ── 尝试合并 ───────────────────── */
        tryMerge(bodyA: any, bodyB: any) {
          const goA = bodyA.gameObject;
          const goB = bodyB.gameObject;
          if (!goA?.active || !goB?.active) return;
          if (goA.lv === undefined || goB.lv === undefined) return;
          if (goA.lv !== goB.lv) return;
          if (goA.merging || goB.merging) return;
          if (goA.lv >= MAX_LV) return;

          goA.merging = true;
          goB.merging = true;

          const mx = (goA.x + goB.x) / 2;
          const my = (goA.y + goB.y) / 2;
          const newLv = goA.lv + 1;

          this.time.delayedCall(MERGE_DELAY_MS, () => {
            if (!this.scene?.isActive()) return;
            if (goA.active) { this.balls.delete(goA); goA.destroy(); }
            if (goB.active) { this.balls.delete(goB); goB.destroy(); }

            const newBall = this.spawnBall(mx, my, newLv);
            newBall.setScale(0.1);
            this.tweens.add({
              targets: newBall, scaleX: 1, scaleY: 1,
              duration: 200, ease: 'Back.easeOut',
            });

            this.score += LEVELS[newLv].score;
            this.hudText?.setText(`得分: ${this.score}`);
            this.spawnPopText(mx, my - LEVELS[newLv].radius, `+${LEVELS[newLv].score}`);
            this.cameras.main.flash(50, 255, 220, 80, false);
          });
        }

        /* ── 生成一颗球 ─────────────────── */
        spawnBall(x: number, y: number, lv: number) {
          const r = LEVELS[lv].radius;
          const ball = this.matter.add.image(x, y, `ball_${lv}`, null, {
            shape: { type: 'circle', radius: r },
            restitution: 0.22,
            friction: 0.5,
            frictionAir: 0.012,
            density: 0.002,
          }) as any;
          ball.setDepth(10);
          ball.lv = lv;
          ball.merging = false;
          ball.spawnTime = this.time.now;
          ball.dangerTimer = 0;
          this.balls.add(ball);
          return ball;
        }

        /* ── 投放当前球 ─────────────────── */
        drop() {
          this.dropLock = true;
          this.dropper.setVisible(false);
          this.lineGfx.clear();

          const ball = this.spawnBall(this.dropperX, dropY, this.currentLv);
          ball.setVelocity(0, 3);

          this.time.delayedCall(DROP_DELAY_MS, () => {
            if (!this.scene?.isActive() || this.status === 'over') return;
            this.currentLv = this.nextLv;
            this.nextLv = Phaser.Math.RND.pick(DROP_POOL);
            const r = LEVELS[this.currentLv].radius;
            this.dropperX = Phaser.Math.Clamp(this.dropperX, wt + r + 1, gameW - wt - r - 1);
            this.dropper.setTexture(`ball_${this.currentLv}`).setX(this.dropperX).setVisible(true);
            this.nextImg?.setTexture(`ball_${this.nextLv}`);
            this.dropLock = false;
          });
        }

        /* ── 分数弹出 ───────────────────── */
        spawnPopText(x: number, y: number, text: string) {
          const t = this.add.text(x, y, text, {
            color: '#ffd54f', fontSize: `${Math.max(10, Math.round(13 * scale))}px`,
            fontFamily: 'sans-serif', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5).setDepth(25);
          this.tweens.add({
            targets: t, y: y - Math.round(32 * scale), alpha: 0,
            duration: 650, ease: 'Power2', onComplete: () => t.destroy(),
          });
        }

        /* ── 游戏结束 ───────────────────── */
        gameOver() {
          if (this.status === 'over') return;
          this.status = 'over';
          this.dropLock = true;
          this.dropper.setVisible(false);
          this.lineGfx.clear();

          if (this.score > this.highScore) {
            this.highScore = this.score;
            if (typeof localStorage !== 'undefined')
              localStorage.setItem('suika-hs', String(this.highScore));
            this.highText?.setText(`最高: ${this.highScore}`);
          }

          this.cameras.main.shake(250, 0.007);
          this.time.delayedCall(200, () => {
            const dimBg = this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x000000, 0.62)
              .setDepth(28);
            const msg = this.add.text(gameW / 2, gameH / 2, [
              '游戏结束',
              `得分：${this.score}`,
              `最高：${this.highScore}`,
              '',
              '点击重新开始',
            ], {
              color: '#ffd54f', fontSize: `${Math.max(18, Math.round(26 * scale))}px`,
              fontFamily: '"Source Han Sans", sans-serif', fontStyle: 'bold',
              stroke: '#1a1a2e', strokeThickness: 6, align: 'center',
            }).setOrigin(0.5).setDepth(30);
            this.overlayGroup.add(dimBg);
            this.overlayGroup.add(msg);
          });
        }

        /* ── 重新开始 ───────────────────── */
        restartGame() {
          // 销毁所有活动球体
          for (const ball of this.balls) {
            if (ball?.active) ball.destroy();
          }
          this.balls.clear();

          // 清除覆盖层
          this.overlayGroup.clear(true, true);

          this.score = 0;
          this.status = 'playing';
          this.dropLock = false;
          this.currentLv = Phaser.Math.RND.pick(DROP_POOL);
          this.nextLv = Phaser.Math.RND.pick(DROP_POOL);
          this.dropperX = gameW / 2;

          this.dropper.setTexture(`ball_${this.currentLv}`).setX(gameW / 2).setVisible(true);
          this.nextImg?.setTexture(`ball_${this.nextLv}`);
          this.hudText?.setText('得分: 0');
          this.highText?.setText(`最高: ${this.highScore}`);
        }

        /* ── update ─────────────────────── */
        update(time: number) {
          /* 危险线闪烁 */
          if (this.dangerGfx) {
            this.dangerGfx.clear();
            const a = 0.3 + Math.sin(time * 0.004) * 0.25;
            this.dangerGfx.lineStyle(Math.max(1, Math.round(scale)), 0xff4444, a);
            this.dangerGfx.beginPath();
            this.dangerGfx.moveTo(wt, dangerY);
            this.dangerGfx.lineTo(gameW - wt, dangerY);
            this.dangerGfx.strokePath();
          }

          /* 投放指示线 */
          if (this.lineGfx) {
            this.lineGfx.clear();
            if (this.status === 'playing' && !this.dropLock) {
              const r = LEVELS[this.currentLv].radius;
              this.lineGfx.lineStyle(Math.max(1, Math.round(scale)), 0xffffff, 0.18);
              this.lineGfx.beginPath();
              this.lineGfx.moveTo(this.dropperX, dropY + r);
              this.lineGfx.lineTo(this.dropperX, gameH - wt);
              this.lineGfx.strokePath();
            }
          }

          /* 危险检测 */
          if (this.status !== 'playing') return;
          for (const ball of this.balls) {
            if (!ball?.active || ball.lv === undefined) continue;
            if (time - ball.spawnTime < 1200) continue; // 刚生成的不检测

            const body = ball.body;
            const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
            const ballTop = body.position.y - LEVELS[ball.lv].radius;

            if (ballTop < dangerY && speed < 0.8) {
              if (!ball.dangerTimer) {
                ball.dangerTimer = time;
              } else if (time - ball.dangerTimer > DANGER_THRESHOLD_MS) {
                this.gameOver();
                return;
              }
            } else {
              ball.dangerTimer = 0;
            }
          }
        }
      }

      const scene = new SuikaScene();
      sceneRef.current = scene;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: gameW,
        height: gameH,
        backgroundColor: '#1a1a2e',
        physics: {
          default: 'matter',
          matter: {
            gravity: { y: GRAVITY },
            debug: false,
          },
        },
        scene,
        antialias: true,
        fps: { target: 60, forceSetTimeOut: false },
      });
    };

    const scheduleBuild = () => {
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(buildGame, 150);
    };

    const init = async () => {
      const mod = await import('phaser');
      if (!mounted) return;
      PhaserLib = mod.default;
      buildGame();

      if (containerRef.current) {
        observer = new ResizeObserver(scheduleBuild);
        observer.observe(containerRef.current);
      }
    };

    void init();

    return () => {
      mounted = false;
      if (rebuildTimer) clearTimeout(rebuildTimer);
      observer?.disconnect();
      if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; }
      sceneRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden min-h-0"
      >
        <div ref={hostRef} style={{ borderRadius: 8, overflow: 'hidden' }} />
      </div>
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-2 px-4">
        <button
          type="button"
          onClick={() => sceneRef.current?.events?.emit('external-restart')}
          className="rounded-lg bg-purple-800 px-4 py-1.5 text-sm font-bold text-yellow-300 shadow
                     hover:bg-purple-700 active:scale-95 transition-all border border-yellow-500/40"
        >
          重新开始
        </button>
        <span className="text-xs text-purple-300/60">相同大小碰撞即可合并升级</span>
      </div>
    </div>
  );
}

export default SuikaGame;
