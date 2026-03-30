// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';

const BASE_CONFIG = {
  rows: 12,
  cols: 8,
  initialRows: 5,
  bubbleRadius: 16,
  topOffset: 18,
  launchSpeed: 480,
  minMatchCount: 3,
  palette: ['#fb7185', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
};

const slotKey = (row: number, col: number) => `${row}:${col}`;

function createEmptyGrid(cfg: typeof BASE_CONFIG) {
  return Array.from({ length: cfg.rows }, () => Array.from({ length: cfg.cols }, () => null as string | null));
}

function randomColor(cfg: typeof BASE_CONFIG) {
  return cfg.palette[Math.floor(Math.random() * cfg.palette.length)] || '#60a5fa';
}

function collectBoardColors(grid: (string | null)[][]) {
  const set = new Set<string>();
  grid.forEach((row) => {
    row.forEach((color) => {
      if (color) set.add(color);
    });
  });
  return Array.from(set);
}

function randomPlayableColor(grid: (string | null)[][], cfg: typeof BASE_CONFIG) {
  const colors = collectBoardColors(grid);
  if (colors.length === 0) return randomColor(cfg);
  return colors[Math.floor(Math.random() * colors.length)] || colors[0] || randomColor(cfg);
}

function pickNextPlayableColor(
  grid: (string | null)[][],
  currentColor: string,
  cfg: typeof BASE_CONFIG
) {
  const colors = collectBoardColors(grid);
  if (colors.length === 0) return randomColor(cfg);

  // 残局保护：颜色数 <= 2 时，提高“同色连发”概率，加速收尾
  if (colors.length <= 2 && colors.includes(currentColor) && Math.random() < 0.78) {
    return currentColor;
  }

  return colors[Math.floor(Math.random() * colors.length)] || colors[0] || randomColor(cfg);
}

function createInitialGrid(cfg: typeof BASE_CONFIG) {
  const grid = createEmptyGrid(cfg);
  for (let row = 0; row < cfg.initialRows; row += 1) {
    for (let col = 0; col < cfg.cols; col += 1) {
      grid[row][col] = randomColor(cfg);
    }
  }
  return grid;
}

function getRowStep(cfg: typeof BASE_CONFIG) {
  return Math.round(cfg.bubbleRadius * 1.73);
}

function getDiameter(cfg: typeof BASE_CONFIG) {
  return cfg.bubbleRadius * 2;
}

function getBoardWidth(cfg: typeof BASE_CONFIG) {
  return getDiameter(cfg) * cfg.cols + cfg.bubbleRadius;
}

function getBoardHeight(cfg: typeof BASE_CONFIG) {
  return cfg.topOffset + getRowStep(cfg) * (cfg.rows + 1) + cfg.bubbleRadius;
}

function getBubblePosition(row: number, col: number, cfg: typeof BASE_CONFIG) {
  const x = cfg.bubbleRadius + col * getDiameter(cfg) + (row % 2 === 1 ? cfg.bubbleRadius : 0);
  const y = cfg.topOffset + cfg.bubbleRadius + row * getRowStep(cfg);
  return { x, y };
}

function isValidSlot(row: number, col: number, cfg: typeof BASE_CONFIG) {
  return row >= 0 && row < cfg.rows && col >= 0 && col < cfg.cols;
}

function getNeighbors(row: number, col: number, cfg: typeof BASE_CONFIG) {
  const even = [
    [-1, -1],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
  ];
  const odd = [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  const dirs = row % 2 === 0 ? even : odd;
  return dirs
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter((item) => isValidSlot(item.row, item.col, cfg));
}

function nearestSlot(x: number, y: number, cfg: typeof BASE_CONFIG) {
  const row = Math.max(0, Math.min(cfg.rows - 1, Math.round((y - cfg.topOffset - cfg.bubbleRadius) / getRowStep(cfg))));
  const rowOffset = row % 2 === 1 ? cfg.bubbleRadius : 0;
  const col = Math.max(0, Math.min(cfg.cols - 1, Math.round((x - cfg.bubbleRadius - rowOffset) / getDiameter(cfg))));
  return { row, col };
}

function hasAdjacentBubble(row: number, col: number, grid: (string | null)[][], cfg: typeof BASE_CONFIG) {
  if (row === 0) return true;
  return getNeighbors(row, col, cfg).some((n) => Boolean(grid[n.row]?.[n.col]));
}

function findAttachSlot(x: number, y: number, grid: (string | null)[][], cfg: typeof BASE_CONFIG, preferred?: { row: number; col: number }) {
  const candidates: Array<{ row: number; col: number }> = [];
  if (preferred && isValidSlot(preferred.row, preferred.col, cfg)) {
    candidates.push(preferred, ...getNeighbors(preferred.row, preferred.col, cfg));
  }
  const near = nearestSlot(x, y, cfg);
  candidates.push(near, ...getNeighbors(near.row, near.col, cfg));

  const unique = Array.from(new Map(candidates.map((s) => [slotKey(s.row, s.col), s])).values());
  let best = null as { row: number; col: number } | null;
  let bestDist = Number.POSITIVE_INFINITY;

  unique.forEach((s) => {
    if (!grid[s.row] || grid[s.row][s.col] || !hasAdjacentBubble(s.row, s.col, grid, cfg)) return;
    const pos = getBubblePosition(s.row, s.col, cfg);
    const dx = pos.x - x;
    const dy = pos.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  });

  return best;
}

function findCollision(x: number, y: number, grid: (string | null)[][], cfg: typeof BASE_CONFIG) {
  const threshold = (cfg.bubbleRadius * 2 - 1) ** 2;
  for (let row = 0; row < cfg.rows; row += 1) {
    for (let col = 0; col < cfg.cols; col += 1) {
      if (!grid[row]?.[col]) continue;
      const pos = getBubblePosition(row, col, cfg);
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (dx * dx + dy * dy <= threshold) return { row, col };
    }
  }
  return null;
}

function resolveMatches(gridInput: (string | null)[][], placed: { row: number; col: number }, cfg: typeof BASE_CONFIG) {
  const grid = gridInput.map((r) => [...r]);
  const color = grid[placed.row]?.[placed.col];
  if (!color) return { grid, removed: 0, matched: 0, dropped: 0, matchedSlots: [], droppedSlots: [] };

  const queue: Array<{ row: number; col: number }> = [placed];
  const visited = new Set<string>();
  const group: Array<{ row: number; col: number }> = [];

  while (queue.length) {
    const cur = queue.shift();
    if (!cur) continue;
    const key = slotKey(cur.row, cur.col);
    if (visited.has(key)) continue;
    visited.add(key);
    if (grid[cur.row]?.[cur.col] !== color) continue;
    group.push(cur);
    getNeighbors(cur.row, cur.col, cfg).forEach((n) => {
      if (!visited.has(slotKey(n.row, n.col))) queue.push(n);
    });
  }

  let matched = 0;
  const matchedSlots: Array<{ row: number; col: number }> = [];
  if (group.length >= cfg.minMatchCount) {
    group.forEach((s) => {
      if (grid[s.row]?.[s.col]) {
        grid[s.row][s.col] = null;
        matched += 1;
        matchedSlots.push({ row: s.row, col: s.col });
      }
    });
  }

  let dropped = 0;
  const droppedSlots: Array<{ row: number; col: number }> = [];
  if (matched > 0) {
    const connected = new Set<string>();
    const topQueue: Array<{ row: number; col: number }> = [];
    for (let col = 0; col < cfg.cols; col += 1) {
      if (grid[0]?.[col]) topQueue.push({ row: 0, col });
    }

    while (topQueue.length) {
      const cur = topQueue.shift();
      if (!cur) continue;
      const key = slotKey(cur.row, cur.col);
      if (connected.has(key) || !grid[cur.row]?.[cur.col]) continue;
      connected.add(key);
      getNeighbors(cur.row, cur.col, cfg).forEach((n) => {
        if (!connected.has(slotKey(n.row, n.col))) topQueue.push(n);
      });
    }

    for (let row = 0; row < cfg.rows; row += 1) {
      for (let col = 0; col < cfg.cols; col += 1) {
        if (grid[row]?.[col] && !connected.has(slotKey(row, col))) {
          grid[row][col] = null;
          dropped += 1;
          droppedSlots.push({ row, col });
        }
      }
    }
  }

  return { grid, matched, dropped, removed: matched + dropped, matchedSlots, droppedSlots };
}

function hasAnyBubble(grid: (string | null)[][]) {
  return grid.some((r) => r.some(Boolean));
}

function reachedDanger(grid: (string | null)[][], cfg: typeof BASE_CONFIG) {
  const from = Math.max(0, cfg.rows - 2);
  for (let row = from; row < cfg.rows; row += 1) {
    if (grid[row]?.some(Boolean)) return true;
  }
  return false;
}

function clampAim(angle: number) {
  const min = -Math.PI + 0.15;
  const max = -0.15;
  return Math.max(min, Math.min(max, angle));
}

export function PhaserBubbleShooter() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    let game: any = null;
    let mounted = true;

    const bootstrap = async () => {
      const PhaserModule = await import('phaser');
      const Phaser = PhaserModule.default;
      if (!mounted || !hostRef.current) return;

      const cfg = BASE_CONFIG;
      const boardWidth = getBoardWidth(cfg);
      const boardHeight = getBoardHeight(cfg);
      const shooterX = boardWidth / 2;
      const shooterY = boardHeight - cfg.bubbleRadius - 12;

      class BubbleShooterScene extends Phaser.Scene {
        grid = createInitialGrid(cfg);
        status: 'ready' | 'shooting' | 'won' | 'lost' = 'ready';
        score = 0;
        shots = 0;
        aimAngle = -Math.PI / 2;
        currentColor = randomColor(cfg);
        nextColor = randomColor(cfg);
        projectile: { x: number; y: number; vx: number; vy: number; color: string } | null = null;
        projectileTrail: Array<{ x: number; y: number; life: number; color: string }> = [];
        popEffects: Array<{ x: number; y: number; life: number; maxLife: number; color: string }> = [];
        fallingBubbles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }> = [];
        floatingTexts: Array<{ go: Phaser.GameObjects.Text; life: number; maxLife: number; vy: number }> = [];
        idlePulse = 0;

        graphics!: Phaser.GameObjects.Graphics;
        hudText!: Phaser.GameObjects.Text;
        overlayText!: Phaser.GameObjects.Text;

        create() {
          this.graphics = this.add.graphics();
          this.currentColor = randomPlayableColor(this.grid, cfg);
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);
          this.hudText = this.add.text(12, 10, '', {
            color: '#334155',
            fontFamily: 'sans-serif',
            fontSize: '14px',
          });
          this.overlayText = this.add.text(boardWidth / 2, boardHeight / 2, '', {
            color: '#ffffff',
            fontFamily: 'sans-serif',
            fontSize: '30px',
            fontStyle: 'bold',
          });
          this.overlayText.setOrigin(0.5);

          this.input.on('pointermove', (pointer: any) => {
            if (this.status !== 'ready') return;
            const raw = Math.atan2(pointer.y - shooterY, pointer.x - shooterX);
            this.aimAngle = clampAim(raw);
          });

          this.input.on('pointerup', () => {
            this.shoot();
          });

          this.events.on('external-restart', () => this.restartGame());
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.floatingTexts.forEach((item) => item.go.destroy());
            this.floatingTexts = [];
          });
          this.drawScene();
        }

        restartGame() {
          this.floatingTexts.forEach((item) => item.go.destroy());
          this.grid = createInitialGrid(cfg);
          this.status = 'ready';
          this.score = 0;
          this.shots = 0;
          this.aimAngle = -Math.PI / 2;
          this.currentColor = randomPlayableColor(this.grid, cfg);
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);
          this.projectile = null;
          this.projectileTrail = [];
          this.popEffects = [];
          this.fallingBubbles = [];
          this.floatingTexts = [];
          this.idlePulse = 0;
          this.drawScene();
        }

        shoot() {
          if (this.status !== 'ready') return;
          const boardColors = collectBoardColors(this.grid);
          if (boardColors.length > 0) {
            if (!boardColors.includes(this.currentColor)) {
              this.currentColor = randomPlayableColor(this.grid, cfg);
            }
            if (!boardColors.includes(this.nextColor)) {
              this.nextColor = randomPlayableColor(this.grid, cfg);
            }
          }
          this.projectile = {
            x: shooterX,
            y: shooterY - cfg.bubbleRadius,
            vx: Math.cos(this.aimAngle) * cfg.launchSpeed,
            vy: Math.sin(this.aimAngle) * cfg.launchSpeed,
            color: this.currentColor,
          };
          this.status = 'shooting';
          this.projectileTrail = [];
          this.cameras.main.shake(35, 0.0012);
        }

        settleProjectile(x: number, y: number, preferred?: { row: number; col: number }) {
          if (!this.projectile) return;
          const landedColor = this.projectile.color;
          const attach = findAttachSlot(x, y, this.grid, cfg, preferred);
          if (!attach || !this.grid[attach.row] || this.grid[attach.row][attach.col]) {
            this.projectile = null;
            this.status = 'lost';
            return;
          }

          this.grid[attach.row][attach.col] = this.projectile.color;
          const resolved = resolveMatches(this.grid, attach, cfg);
          this.grid = resolved.grid;
          this.shots += 1;

          const attachPos = getBubblePosition(attach.row, attach.col, cfg);
          this.spawnPop(attachPos.x, attachPos.y, landedColor, 0.35);

          if (resolved.removed > 0) {
            this.score += resolved.matched * 10 + resolved.dropped * 15;
            resolved.matchedSlots.forEach((slot: { row: number; col: number }) => {
              const pos = getBubblePosition(slot.row, slot.col, cfg);
              this.spawnPop(pos.x, pos.y, landedColor, 0.7);
            });
            resolved.droppedSlots.forEach((slot: { row: number; col: number }) => {
              const pos = getBubblePosition(slot.row, slot.col, cfg);
              this.fallingBubbles.push({
                x: pos.x,
                y: pos.y,
                vx: Phaser.Math.FloatBetween(-40, 40),
                vy: Phaser.Math.FloatBetween(40, 100),
                size: cfg.bubbleRadius - 1,
                color: randomColor(cfg),
                life: 1.2,
              });
            });
            const gain = resolved.matched * 10 + resolved.dropped * 15;
            this.spawnFloatingText(attachPos.x, attachPos.y - 14, `+${gain}`, '#16a34a');
            this.cameras.main.shake(70, 0.0022);
          }

          if (!hasAnyBubble(this.grid)) {
            this.status = 'won';
          } else if (reachedDanger(this.grid, cfg)) {
            this.status = 'lost';
          } else {
            this.status = 'ready';
          }

          this.projectile = null;
          this.projectileTrail = [];
          this.currentColor = this.nextColor;
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);
        }

        spawnPop(x: number, y: number, color: string, strength = 0.6) {
          const count = Math.max(4, Math.floor(8 * strength));
          for (let i = 0; i < count; i += 1) {
            this.popEffects.push({
              x: x + Phaser.Math.FloatBetween(-3, 3),
              y: y + Phaser.Math.FloatBetween(-3, 3),
              life: Phaser.Math.FloatBetween(0.18, 0.35) + strength * 0.08,
              maxLife: 0.42 + strength * 0.15,
              color,
            });
          }
        }

        spawnFloatingText(x: number, y: number, text: string, color: string) {
          const go = this.add.text(x, y, text, {
            color,
            fontFamily: 'sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
          });
          go.setOrigin(0.5);
          go.setDepth(12);
          this.floatingTexts.push({ go, life: 0.7, maxLife: 0.7, vy: -35 });
        }

        update(_time: number, deltaMs: number) {
          const dt = Math.min(deltaMs / 1000, 0.05);
          this.idlePulse += deltaMs * 0.005;

          if (this.status === 'shooting' && this.projectile) {
            let nextX = this.projectile.x + this.projectile.vx * dt;
            const nextY = this.projectile.y + this.projectile.vy * dt;
            let nextVx = this.projectile.vx;

            if (nextX <= cfg.bubbleRadius) {
              nextX = cfg.bubbleRadius;
              this.spawnPop(nextX + 2, nextY, '#ffffff', 0.25);
              nextVx = Math.abs(nextVx);
            } else if (nextX >= boardWidth - cfg.bubbleRadius) {
              nextX = boardWidth - cfg.bubbleRadius;
              this.spawnPop(nextX - 2, nextY, '#ffffff', 0.25);
              nextVx = -Math.abs(nextVx);
            }

            if (nextY <= cfg.topOffset + cfg.bubbleRadius) {
              this.settleProjectile(nextX, cfg.topOffset + cfg.bubbleRadius, nearestSlot(nextX, nextY, cfg));
            } else {
              const collision = findCollision(nextX, nextY, this.grid, cfg);
              if (collision) {
                this.settleProjectile(nextX, nextY, collision);
              } else if (this.projectile) {
                this.projectile.x = nextX;
                this.projectile.y = nextY;
                this.projectile.vx = nextVx;
                this.projectileTrail.push({
                  x: nextX,
                  y: nextY,
                  life: 0.22,
                  color: this.projectile.color,
                });
              }
            }
          }

          this.projectileTrail = this.projectileTrail
            .map((item) => ({ ...item, life: item.life - dt }))
            .filter((item) => item.life > 0);

          this.popEffects = this.popEffects
            .map((item) => ({ ...item, life: item.life - dt }))
            .filter((item) => item.life > 0);

          this.fallingBubbles = this.fallingBubbles
            .map((item) => ({
              ...item,
              x: item.x + item.vx * dt,
              y: item.y + item.vy * dt,
              vy: item.vy + 420 * dt,
              life: item.life - dt,
            }))
            .filter((item) => item.life > 0 && item.y < boardHeight + 40);

          this.floatingTexts = this.floatingTexts
            .map((item) => ({
              ...item,
              go: item.go.setPosition(item.go.x, item.go.y + item.vy * dt),
              life: item.life - dt,
            }))
            .filter((item) => {
              const alpha = Math.max(0, item.life / item.maxLife);
              item.go.setAlpha(alpha);
              if (item.life <= 0) {
                item.go.destroy();
                return false;
              }
              return true;
            });

          this.drawScene();
        }

        drawBubble(x: number, y: number, radius: number, color: string) {
          this.graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
          this.graphics.fillCircle(x, y, radius);
          this.graphics.fillStyle(0xffffff, 0.22);
          this.graphics.fillCircle(x - radius * 0.32, y - radius * 0.36, radius * 0.35);
          this.graphics.lineStyle(1, 0x334155, 0.22);
          this.graphics.strokeCircle(x, y, radius);
        }

        drawAimGuide() {
          if (this.status !== 'ready') return;
          let px = shooterX;
          let py = shooterY;
          let vx = Math.cos(this.aimAngle);
          let vy = Math.sin(this.aimAngle);
          const stepLen = cfg.bubbleRadius * 0.9;

          this.graphics.fillStyle(0x334155, 0.55);
          for (let i = 1; i <= 26; i += 1) {
            px += vx * stepLen;
            py += vy * stepLen;

            if (px <= cfg.bubbleRadius || px >= boardWidth - cfg.bubbleRadius) {
              vx *= -1;
              px = Phaser.Math.Clamp(px, cfg.bubbleRadius, boardWidth - cfg.bubbleRadius);
            }
            if (py <= cfg.topOffset + cfg.bubbleRadius) break;

            const alpha = Math.max(0.12, 0.55 - i * 0.018);
            this.graphics.fillStyle(0x334155, alpha);
            this.graphics.fillCircle(px, py, Math.max(1.4, 2.8 - i * 0.07));
          }
        }

        drawScene() {
          this.graphics.clear();

          this.graphics.fillGradientStyle(0xf8fafc, 0xf8fafc, 0xe2e8f0, 0xe2e8f0, 1);
          this.graphics.fillRect(0, 0, boardWidth, boardHeight);

          this.graphics.fillStyle(0x94a3b8, 0.2);
          this.graphics.fillRect(0, shooterY - cfg.bubbleRadius * 1.3, boardWidth, 2);

          for (let row = 0; row < cfg.rows; row += 1) {
            for (let col = 0; col < cfg.cols; col += 1) {
              const color = this.grid[row]?.[col];
              if (!color) continue;
              const pos = getBubblePosition(row, col, cfg);
              this.drawBubble(pos.x, pos.y, cfg.bubbleRadius - 0.5, color);
            }
          }

          this.drawAimGuide();

          this.projectileTrail.forEach((trail) => {
            this.graphics.fillStyle(Phaser.Display.Color.HexStringToColor(trail.color).color, trail.life * 1.6);
            this.graphics.fillCircle(trail.x, trail.y, 2.5 + trail.life * 5);
          });

          const launchPulse = this.status === 'ready' ? Math.sin(this.idlePulse) * 0.6 : 0;
          this.drawBubble(shooterX, shooterY, cfg.bubbleRadius - 0.5 + launchPulse, this.currentColor);

          if (this.projectile) {
            this.drawBubble(this.projectile.x, this.projectile.y, cfg.bubbleRadius - 0.5, this.projectile.color);
          }

          this.drawBubble(boardWidth - cfg.bubbleRadius * 1.6, shooterY, cfg.bubbleRadius * 0.72, this.nextColor);
          this.graphics.fillStyle(0x334155, 0.7);
          this.graphics.fillCircle(boardWidth - cfg.bubbleRadius * 1.6, shooterY, 2);

          this.popEffects.forEach((fx) => {
            const alpha = Math.max(0, fx.life / fx.maxLife);
            this.graphics.fillStyle(Phaser.Display.Color.HexStringToColor(fx.color).color, alpha);
            this.graphics.fillCircle(fx.x, fx.y, 2 + (1 - alpha) * 4.5);
          });

          this.fallingBubbles.forEach((item) => {
            this.graphics.fillStyle(Phaser.Display.Color.HexStringToColor(item.color).color, Math.max(0.2, item.life / 1.2));
            this.graphics.fillCircle(item.x, item.y, item.size);
          });

          const statusText =
            this.status === 'ready' ? '待发射' : this.status === 'shooting' ? '发射中' : this.status === 'won' ? '胜利' : '失败';
          this.hudText.setText(`状态：${statusText}   分数：${this.score}   发射次数：${this.shots}`);

          if (this.status === 'won' || this.status === 'lost') {
            this.graphics.fillStyle(0x0f172a, 0.5);
            this.graphics.fillRect(0, 0, boardWidth, boardHeight);
            this.overlayText.setText(this.status === 'won' ? 'You Win!' : 'Game Over');
            this.overlayText.setVisible(true);
          } else {
            this.overlayText.setVisible(false);
          }
        }
      }

      const scene = new BubbleShooterScene();
      sceneRef.current = scene;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: boardWidth,
        height: boardHeight,
        backgroundColor: '#f8fafc',
        scene,
        antialias: true,
        fps: { target: 60, forceSetTimeOut: false },
      });
    };

    void bootstrap();

    return () => {
      mounted = false;
      if (sceneRef.current) {
        sceneRef.current.events?.off('external-restart');
      }
      if (game) {
        game.destroy(true);
      }
      sceneRef.current = null;
    };
  }, []);

  return (
    <div>
      <div ref={hostRef} style={{ width: '100%', maxWidth: 560, borderRadius: 12, overflow: 'hidden', border: '1px solid #cbd5e1' }} />
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          onClick={() => sceneRef.current?.events?.emit('external-restart')}
          style={{ padding: '8px 12px' }}
        >
          重新开始
        </button>
      </div>
    </div>
  );
}

export default PhaserBubbleShooter;
