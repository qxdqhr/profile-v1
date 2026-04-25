// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   岁家龙泡泡 · 5 种角色（图片版）
   图片来自 Reddit OC by Dimongo (使用已获授权)
───────────────────────────────────────────── */
const BUBBLE_TYPES = [
  { id: '年', label: '年', imageKey: 'nian',     hex: '#c62828', dark: '#8b0000', light: '#ef9a9a' },
  { id: '夕', label: '夕', imageKey: 'dusk',     hex: '#263238', dark: '#0d1b1e', light: '#80deea' },
  { id: '令', label: '令', imageKey: 'ling',     hex: '#0d47a1', dark: '#002171', light: '#90caf9' },
  { id: '重', label: '重', imageKey: 'chongyue', hex: '#1a1a2e', dark: '#0a0a18', light: '#b0bec5' },
  { id: '黍', label: '黍', imageKey: 'shu',      hex: '#37474f', dark: '#1c313a', light: '#cfd8dc' },
] as const;

type BubbleId = (typeof BUBBLE_TYPES)[number]['id'];

const BUBBLE_MAP: Record<BubbleId, (typeof BUBBLE_TYPES)[number]> = Object.fromEntries(
  BUBBLE_TYPES.map((t) => [t.id, t])
) as Record<BubbleId, (typeof BUBBLE_TYPES)[number]>;

const IMAGE_PATH = (key: string) => `/images/dragonBeans/${key}.png`;

/* ─────────────────────────────────────────────
   游戏基础配置（bubbleRadius 由容器尺寸动态计算）
───────────────────────────────────────────── */
const BASE_CONFIG = {
  rows: 12,
  cols: 8,
  initialRows: 5,
  bubbleRadius: 22, // 初始默认值，实际运行时会被覆盖
  topOffset: 18,
  launchSpeed: 480,
  minMatchCount: 3,
  palette: BUBBLE_TYPES.map((t) => t.id) as string[],
};

/* ─── 根据容器尺寸计算 bubbleRadius ──────── */
function calcBubbleRadius(containerW: number, containerH: number): number {
  const { cols, rows } = BASE_CONFIG;
  // boardWidth  = r * (cols * 2 + 1)
  // boardHeight ≈ 18 + r * (rows * 1.73 + 2)
  const rFromW = containerW / (cols * 2 + 1);
  const rFromH = (containerH - 20) / (rows * 1.73 + 2);
  return Math.max(16, Math.min(Math.floor(Math.min(rFromW, rFromH)), 50));
}

/* ─── 通用工具函数 ────────────────────────── */
const slotKey = (row: number, col: number) => `${row}:${col}`;

function createEmptyGrid(cfg: typeof BASE_CONFIG) {
  return Array.from({ length: cfg.rows }, () =>
    Array.from({ length: cfg.cols }, () => null as string | null)
  );
}

function randomColor(cfg: typeof BASE_CONFIG) {
  return cfg.palette[Math.floor(Math.random() * cfg.palette.length)] ?? cfg.palette[0]!;
}

function collectBoardColors(grid: (string | null)[][]) {
  const set = new Set<string>();
  grid.forEach((row) => row.forEach((c) => { if (c) set.add(c); }));
  return Array.from(set);
}

function randomPlayableColor(grid: (string | null)[][], cfg: typeof BASE_CONFIG) {
  const colors = collectBoardColors(grid);
  if (colors.length === 0) return randomColor(cfg);
  return colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? randomColor(cfg);
}

function pickNextPlayableColor(grid: (string | null)[][], current: string, cfg: typeof BASE_CONFIG) {
  const colors = collectBoardColors(grid);
  if (colors.length === 0) return randomColor(cfg);
  if (colors.length <= 2 && colors.includes(current) && Math.random() < 0.78) return current;
  return colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? randomColor(cfg);
}

function createInitialGrid(cfg: typeof BASE_CONFIG) {
  const grid = createEmptyGrid(cfg);
  for (let row = 0; row < cfg.initialRows; row++)
    for (let col = 0; col < cfg.cols; col++)
      grid[row][col] = randomColor(cfg);
  return grid;
}

function getRowStep(cfg: typeof BASE_CONFIG) { return Math.round(cfg.bubbleRadius * 1.73); }
function getDiameter(cfg: typeof BASE_CONFIG) { return cfg.bubbleRadius * 2; }
function getBoardWidth(cfg: typeof BASE_CONFIG) { return getDiameter(cfg) * cfg.cols + cfg.bubbleRadius; }
function getBoardHeight(cfg: typeof BASE_CONFIG) { return cfg.topOffset + getRowStep(cfg) * (cfg.rows + 1) + cfg.bubbleRadius; }

function getBubblePosition(row: number, col: number, cfg: typeof BASE_CONFIG) {
  const x = cfg.bubbleRadius + col * getDiameter(cfg) + (row % 2 === 1 ? cfg.bubbleRadius : 0);
  const y = cfg.topOffset + cfg.bubbleRadius + row * getRowStep(cfg);
  return { x, y };
}

function isValidSlot(row: number, col: number, cfg: typeof BASE_CONFIG) {
  return row >= 0 && row < cfg.rows && col >= 0 && col < cfg.cols;
}

function getNeighbors(row: number, col: number, cfg: typeof BASE_CONFIG) {
  const even = [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];
  const odd  = [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]];
  const dirs = row % 2 === 0 ? even : odd;
  return dirs.map(([dr,dc]) => ({ row: row+dr, col: col+dc })).filter((s) => isValidSlot(s.row, s.col, cfg));
}

function nearestSlot(x: number, y: number, cfg: typeof BASE_CONFIG) {
  const row = Math.max(0, Math.min(cfg.rows-1, Math.round((y - cfg.topOffset - cfg.bubbleRadius) / getRowStep(cfg))));
  const col = Math.max(0, Math.min(cfg.cols-1, Math.round((x - cfg.bubbleRadius - (row%2===1?cfg.bubbleRadius:0)) / getDiameter(cfg))));
  return { row, col };
}

function hasAdjacentBubble(row: number, col: number, grid: (string|null)[][], cfg: typeof BASE_CONFIG) {
  if (row === 0) return true;
  return getNeighbors(row, col, cfg).some((n) => Boolean(grid[n.row]?.[n.col]));
}

function findAttachSlot(x: number, y: number, grid: (string|null)[][], cfg: typeof BASE_CONFIG, preferred?: {row:number;col:number}) {
  const candidates: {row:number;col:number}[] = [];
  if (preferred && isValidSlot(preferred.row, preferred.col, cfg))
    candidates.push(preferred, ...getNeighbors(preferred.row, preferred.col, cfg));
  const near = nearestSlot(x, y, cfg);
  candidates.push(near, ...getNeighbors(near.row, near.col, cfg));
  const unique = Array.from(new Map(candidates.map((s) => [slotKey(s.row, s.col), s])).values());
  let best: {row:number;col:number}|null = null;
  let bestDist = Infinity;
  unique.forEach((s) => {
    if (!grid[s.row] || grid[s.row][s.col] || !hasAdjacentBubble(s.row, s.col, grid, cfg)) return;
    const pos = getBubblePosition(s.row, s.col, cfg);
    const d = (pos.x-x)**2 + (pos.y-y)**2;
    if (d < bestDist) { best = s; bestDist = d; }
  });
  return best;
}

function findCollision(x: number, y: number, grid: (string|null)[][], cfg: typeof BASE_CONFIG) {
  const threshold = (cfg.bubbleRadius*2-1)**2;
  for (let row = 0; row < cfg.rows; row++)
    for (let col = 0; col < cfg.cols; col++) {
      if (!grid[row]?.[col]) continue;
      const pos = getBubblePosition(row, col, cfg);
      if ((pos.x-x)**2 + (pos.y-y)**2 <= threshold) return { row, col };
    }
  return null;
}

function resolveMatches(gridIn: (string|null)[][], placed: {row:number;col:number}, cfg: typeof BASE_CONFIG) {
  const grid = gridIn.map((r) => [...r]);
  const color = grid[placed.row]?.[placed.col];
  if (!color) return { grid, removed:0, matched:0, dropped:0, matchedSlots:[], droppedSlots:[] };

  const queue: {row:number;col:number}[] = [placed];
  const visited = new Set<string>();
  const group: {row:number;col:number}[] = [];
  while (queue.length) {
    const cur = queue.shift(); if (!cur) continue;
    const k = slotKey(cur.row, cur.col);
    if (visited.has(k)) continue; visited.add(k);
    if (grid[cur.row]?.[cur.col] !== color) continue;
    group.push(cur);
    getNeighbors(cur.row, cur.col, cfg).forEach((n) => { if (!visited.has(slotKey(n.row, n.col))) queue.push(n); });
  }

  const matchedSlots: {row:number;col:number}[] = [];
  let matched = 0;
  if (group.length >= cfg.minMatchCount)
    group.forEach((s) => { if (grid[s.row]?.[s.col]) { grid[s.row][s.col]=null; matched++; matchedSlots.push(s); } });

  let dropped = 0;
  const droppedSlots: {row:number;col:number}[] = [];
  if (matched > 0) {
    const connected = new Set<string>();
    const tq: {row:number;col:number}[] = [];
    for (let c = 0; c < cfg.cols; c++) if (grid[0]?.[c]) tq.push({row:0,col:c});
    while (tq.length) {
      const cur = tq.shift(); if (!cur) continue;
      const k = slotKey(cur.row, cur.col);
      if (connected.has(k) || !grid[cur.row]?.[cur.col]) continue;
      connected.add(k);
      getNeighbors(cur.row, cur.col, cfg).forEach((n) => { if (!connected.has(slotKey(n.row, n.col))) tq.push(n); });
    }
    for (let row=0; row<cfg.rows; row++)
      for (let col=0; col<cfg.cols; col++)
        if (grid[row]?.[col] && !connected.has(slotKey(row, col)))
          { grid[row][col]=null; dropped++; droppedSlots.push({row,col}); }
  }
  return { grid, matched, dropped, removed: matched+dropped, matchedSlots, droppedSlots };
}

function hasAnyBubble(grid: (string|null)[][]) { return grid.some((r) => r.some(Boolean)); }

function reachedDanger(grid: (string|null)[][], cfg: typeof BASE_CONFIG) {
  const from = Math.max(0, cfg.rows-2);
  for (let row=from; row<cfg.rows; row++) if (grid[row]?.some(Boolean)) return true;
  return false;
}

function clampAim(angle: number) { return Math.max(-Math.PI+0.15, Math.min(-0.15, angle)); }

/* ─────────────────────────────────────────────
   主组件
───────────────────────────────────────────── */
export function ArknightsBubbleShooter() {
  const containerRef = useRef<HTMLDivElement | null>(null); // 量取可用空间
  const hostRef = useRef<HTMLDivElement | null>(null);      // Phaser 挂载点
  const sceneRef = useRef<any>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let PhaserLib: any = null;
    let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: ResizeObserver | null = null;

    /* ── 构建游戏（每次容器尺寸变化时调用）── */
    const buildGame = () => {
      if (!mounted || !PhaserLib || !containerRef.current || !hostRef.current) return;

      // 销毁旧实例
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
      hostRef.current.innerHTML = '';

      const Phaser = PhaserLib;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      if (containerW < 100 || containerH < 100) return;

      const bubbleRadius = calcBubbleRadius(containerW, containerH);
      const cfg = { ...BASE_CONFIG, bubbleRadius };
      const boardWidth = getBoardWidth(cfg);
      const boardHeight = getBoardHeight(cfg);
      const shooterX = boardWidth / 2;
      const shooterY = boardHeight - cfg.bubbleRadius - 12;

      function hexToPhaserColor(hex: string) {
        return Phaser.Display.Color.HexStringToColor(hex).color;
      }

      class DragonBubbleScene extends Phaser.Scene {
        grid = createInitialGrid(cfg);
        status: 'ready'|'shooting'|'won'|'lost' = 'ready';
        score = 0;
        shots = 0;
        aimAngle = -Math.PI/2;
        currentColor = randomColor(cfg);
        nextColor = randomColor(cfg);
        projectile: {x:number;y:number;vx:number;vy:number;color:string}|null = null;
        projectileTrail: {x:number;y:number;life:number;color:string}[] = [];
        popEffects: {x:number;y:number;life:number;maxLife:number;color:string}[] = [];
        fallingBubbles: {x:number;y:number;vx:number;vy:number;size:number;color:string;life:number}[] = [];
        floatingTexts: {go:any;life:number;maxLife:number;vy:number}[] = [];
        idlePulse = 0;

        bubbleImages: Map<string, any> = new Map();
        projImage: any = null;
        shooterImg: any = null;
        nextImg: any = null;

        bgGraphics!: any;
        fxGraphics!: any;
        hudText!: any;
        overlayText!: any;

        preload() {
          BUBBLE_TYPES.forEach((t) => {
            this.load.image(t.imageKey, IMAGE_PATH(t.imageKey));
          });
        }

        create() {
          this.bgGraphics = this.add.graphics().setDepth(0);
          this.fxGraphics = this.add.graphics().setDepth(10);

          this.currentColor = randomPlayableColor(this.grid, cfg);
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);

          this.hudText = this.add.text(10, 6, '', {
            color: '#ffd54f',
            fontFamily: '"Source Han Sans", "Noto Sans SC", sans-serif',
            fontSize: `${Math.max(11, Math.round(cfg.bubbleRadius * 0.55))}px`,
            stroke: '#1a0000',
            strokeThickness: 3,
          }).setDepth(20);

          this.overlayText = this.add.text(boardWidth/2, boardHeight/2, '', {
            color: '#ffd54f',
            fontFamily: '"Source Han Sans", "Noto Sans SC", sans-serif',
            fontSize: `${Math.max(24, Math.round(cfg.bubbleRadius * 1.4))}px`,
            fontStyle: 'bold',
            stroke: '#1a0000',
            strokeThickness: 6,
          }).setOrigin(0.5).setDepth(30);

          this.syncBubbleImages();

          const curKey = BUBBLE_MAP[this.currentColor as BubbleId]?.imageKey ?? 'nian';
          const nextKey = BUBBLE_MAP[this.nextColor as BubbleId]?.imageKey ?? 'nian';
          const nextX = boardWidth - cfg.bubbleRadius * 1.6;

          this.shooterImg = this.add.image(shooterX, shooterY, curKey)
            .setDisplaySize(cfg.bubbleRadius * 2.1, cfg.bubbleRadius * 2.1)
            .setDepth(8);

          this.projImage = this.add.image(shooterX, shooterY, curKey)
            .setDisplaySize(cfg.bubbleRadius * 2, cfg.bubbleRadius * 2)
            .setDepth(8)
            .setVisible(false);

          this.nextImg = this.add.image(nextX, shooterY, nextKey)
            .setDisplaySize(cfg.bubbleRadius * 1.5, cfg.bubbleRadius * 1.5)
            .setDepth(8);

          this.input.on('pointermove', (pointer: any) => {
            if (this.status !== 'ready') return;
            this.aimAngle = clampAim(Math.atan2(pointer.y - shooterY, pointer.x - shooterX));
          });
          this.input.on('pointerup', () => this.shoot());
          this.events.on('external-restart', () => this.restartGame());
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.floatingTexts.forEach((i) => i.go.destroy());
            this.floatingTexts = [];
            this.destroyAllImages();
          });
        }

        syncBubbleImages() {
          const alive = new Set<string>();
          for (let row = 0; row < cfg.rows; row++) {
            for (let col = 0; col < cfg.cols; col++) {
              const id = this.grid[row]?.[col];
              if (!id) continue;
              const key = slotKey(row, col);
              alive.add(key);
              const type = BUBBLE_MAP[id as BubbleId];
              if (!type) continue;
              const pos = getBubblePosition(row, col, cfg);
              if (!this.bubbleImages.has(key)) {
                const img = this.add.image(pos.x, pos.y, type.imageKey)
                  .setDisplaySize(cfg.bubbleRadius * 1.9, cfg.bubbleRadius * 1.9)
                  .setDepth(5);
                this.bubbleImages.set(key, img);
              }
            }
          }
          for (const [key, img] of this.bubbleImages) {
            if (!alive.has(key)) { img.destroy(); this.bubbleImages.delete(key); }
          }
          if (this.shooterImg) {
            const key = BUBBLE_MAP[this.currentColor as BubbleId]?.imageKey ?? 'nian';
            this.shooterImg.setTexture(key);
          }
          if (this.nextImg) {
            const nextX = boardWidth - cfg.bubbleRadius * 1.6;
            const key = BUBBLE_MAP[this.nextColor as BubbleId]?.imageKey ?? 'nian';
            this.nextImg.setTexture(key).setPosition(nextX, shooterY);
          }
        }

        destroyAllImages() {
          for (const img of this.bubbleImages.values()) img.destroy();
          this.bubbleImages.clear();
          this.projImage?.destroy(); this.projImage = null;
          this.shooterImg?.destroy(); this.shooterImg = null;
          this.nextImg?.destroy(); this.nextImg = null;
        }

        restartGame() {
          this.floatingTexts.forEach((i) => i.go.destroy());
          this.floatingTexts = [];
          this.destroyAllImages();
          this.grid = createInitialGrid(cfg);
          this.status = 'ready';
          this.score = 0; this.shots = 0;
          this.aimAngle = -Math.PI/2;
          this.currentColor = randomPlayableColor(this.grid, cfg);
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);
          this.projectile = null;
          this.projectileTrail = []; this.popEffects = []; this.fallingBubbles = [];
          this.idlePulse = 0;

          this.syncBubbleImages();

          const curKey = BUBBLE_MAP[this.currentColor as BubbleId]?.imageKey ?? 'nian';
          const nextX = boardWidth - cfg.bubbleRadius * 1.6;
          this.shooterImg = this.add.image(shooterX, shooterY, curKey)
            .setDisplaySize(cfg.bubbleRadius * 2.1, cfg.bubbleRadius * 2.1).setDepth(8);
          this.projImage = this.add.image(shooterX, shooterY, curKey)
            .setDisplaySize(cfg.bubbleRadius * 2, cfg.bubbleRadius * 2).setDepth(8).setVisible(false);
          const nextKey = BUBBLE_MAP[this.nextColor as BubbleId]?.imageKey ?? 'nian';
          this.nextImg = this.add.image(nextX, shooterY, nextKey)
            .setDisplaySize(cfg.bubbleRadius * 1.5, cfg.bubbleRadius * 1.5).setDepth(8);
        }

        shoot() {
          if (this.status !== 'ready') return;
          const boardColors = collectBoardColors(this.grid);
          if (boardColors.length > 0) {
            if (!boardColors.includes(this.currentColor)) this.currentColor = randomPlayableColor(this.grid, cfg);
            if (!boardColors.includes(this.nextColor)) this.nextColor = randomPlayableColor(this.grid, cfg);
          }
          this.projectile = {
            x: shooterX, y: shooterY - cfg.bubbleRadius,
            vx: Math.cos(this.aimAngle)*cfg.launchSpeed,
            vy: Math.sin(this.aimAngle)*cfg.launchSpeed,
            color: this.currentColor,
          };
          if (this.projImage) {
            const key = BUBBLE_MAP[this.currentColor as BubbleId]?.imageKey ?? 'nian';
            this.projImage.setTexture(key).setPosition(shooterX, shooterY - cfg.bubbleRadius).setVisible(true);
          }
          if (this.shooterImg) this.shooterImg.setVisible(false);
          this.status = 'shooting';
          this.projectileTrail = [];
          this.cameras.main.shake(35, 0.001);
        }

        settleProjectile(x: number, y: number, preferred?: {row:number;col:number}) {
          if (!this.projectile) return;
          const landedColor = this.projectile.color;
          const attach = findAttachSlot(x, y, this.grid, cfg, preferred);
          if (!attach || !this.grid[attach.row] || this.grid[attach.row][attach.col]) {
            if (this.projImage) this.projImage.setVisible(false);
            this.projectile = null; this.status = 'lost'; return;
          }
          this.grid[attach.row][attach.col] = this.projectile.color;
          const resolved = resolveMatches(this.grid, attach, cfg);
          this.grid = resolved.grid;
          this.shots++;

          const attachPos = getBubblePosition(attach.row, attach.col, cfg);
          this.spawnPop(attachPos.x, attachPos.y, landedColor, 0.35);

          if (resolved.removed > 0) {
            this.score += resolved.matched*10 + resolved.dropped*15;
            resolved.matchedSlots.forEach((s: any) => {
              const pos = getBubblePosition(s.row, s.col, cfg);
              this.spawnPop(pos.x, pos.y, landedColor, 0.7);
            });
            resolved.droppedSlots.forEach((s: any) => {
              const pos = getBubblePosition(s.row, s.col, cfg);
              this.fallingBubbles.push({
                x: pos.x, y: pos.y,
                vx: Phaser.Math.FloatBetween(-40, 40),
                vy: Phaser.Math.FloatBetween(40, 100),
                size: cfg.bubbleRadius-1, color: randomColor(cfg), life: 1.2,
              });
            });
            const gain = resolved.matched*10 + resolved.dropped*15;
            this.spawnFloatingText(attachPos.x, attachPos.y-14, `+${gain}`, '#ffd54f');
            this.cameras.main.shake(70, 0.002);
          }

          if (!hasAnyBubble(this.grid)) this.status = 'won';
          else if (reachedDanger(this.grid, cfg)) this.status = 'lost';
          else this.status = 'ready';

          if (this.projImage) this.projImage.setVisible(false);
          this.projectile = null;
          this.projectileTrail = [];
          this.currentColor = this.nextColor;
          this.nextColor = pickNextPlayableColor(this.grid, this.currentColor, cfg);
          this.syncBubbleImages();
          if (this.shooterImg && this.status === 'ready') {
            const key = BUBBLE_MAP[this.currentColor as BubbleId]?.imageKey ?? 'nian';
            this.shooterImg.setTexture(key).setVisible(true);
          }
        }

        spawnPop(x: number, y: number, color: string, strength = 0.6) {
          const count = Math.max(4, Math.floor(8*strength));
          for (let i=0; i<count; i++)
            this.popEffects.push({
              x: x + Phaser.Math.FloatBetween(-3,3),
              y: y + Phaser.Math.FloatBetween(-3,3),
              life: Phaser.Math.FloatBetween(0.18, 0.35) + strength*0.08,
              maxLife: 0.42 + strength*0.15, color,
            });
        }

        spawnFloatingText(x: number, y: number, text: string, color: string) {
          const go = this.add.text(x, y, text, {
            color, fontFamily: 'sans-serif',
            fontSize: `${Math.max(12, Math.round(cfg.bubbleRadius * 0.7))}px`,
            fontStyle: 'bold', stroke: '#1a0000', strokeThickness: 3,
          }).setOrigin(0.5).setDepth(25);
          this.floatingTexts.push({ go, life: 0.7, maxLife: 0.7, vy: -35 });
        }

        update(_time: number, deltaMs: number) {
          const dt = Math.min(deltaMs/1000, 0.05);
          this.idlePulse += deltaMs * 0.005;

          if (this.status === 'shooting' && this.projectile) {
            let nx = this.projectile.x + this.projectile.vx*dt;
            const ny = this.projectile.y + this.projectile.vy*dt;
            let nvx = this.projectile.vx;

            if (nx <= cfg.bubbleRadius) { nx = cfg.bubbleRadius; this.spawnPop(nx+2, ny, '#ffd54f', 0.25); nvx = Math.abs(nvx); }
            else if (nx >= boardWidth - cfg.bubbleRadius) { nx = boardWidth-cfg.bubbleRadius; this.spawnPop(nx-2, ny, '#ffd54f', 0.25); nvx = -Math.abs(nvx); }

            if (ny <= cfg.topOffset + cfg.bubbleRadius) {
              this.settleProjectile(nx, cfg.topOffset+cfg.bubbleRadius, nearestSlot(nx, ny, cfg));
            } else {
              const collision = findCollision(nx, ny, this.grid, cfg);
              if (collision) {
                this.settleProjectile(nx, ny, collision);
              } else if (this.projectile) {
                this.projectile.x = nx; this.projectile.y = ny; this.projectile.vx = nvx;
                if (this.projImage) this.projImage.setPosition(nx, ny);
                this.projectileTrail.push({ x: nx, y: ny, life: 0.22, color: this.projectile.color });
              }
            }
          }

          this.projectileTrail = this.projectileTrail.map((i) => ({...i, life: i.life-dt})).filter((i) => i.life>0);
          this.popEffects = this.popEffects.map((i) => ({...i, life: i.life-dt})).filter((i) => i.life>0);
          this.fallingBubbles = this.fallingBubbles
            .map((i) => ({...i, x: i.x+i.vx*dt, y: i.y+i.vy*dt, vy: i.vy+420*dt, life: i.life-dt}))
            .filter((i) => i.life>0 && i.y<boardHeight+40);
          this.floatingTexts = this.floatingTexts
            .map((i) => ({...i, go: i.go.setPosition(i.go.x, i.go.y+i.vy*dt), life: i.life-dt}))
            .filter((i) => { i.go.setAlpha(Math.max(0, i.life/i.maxLife)); if (i.life<=0) { i.go.destroy(); return false; } return true; });

          this.drawScene();
        }

        drawAimGuide() {
          if (this.status !== 'ready') return;
          let px = shooterX, py = shooterY;
          let vx = Math.cos(this.aimAngle), vy = Math.sin(this.aimAngle);
          const step = cfg.bubbleRadius * 0.9;
          for (let i=1; i<=26; i++) {
            px += vx*step; py += vy*step;
            if (px <= cfg.bubbleRadius || px >= boardWidth-cfg.bubbleRadius) { vx *= -1; px = Phaser.Math.Clamp(px, cfg.bubbleRadius, boardWidth-cfg.bubbleRadius); }
            if (py <= cfg.topOffset+cfg.bubbleRadius) break;
            const alpha = Math.max(0.08, 0.5-i*0.017);
            this.fxGraphics.fillStyle(0xffd54f, alpha);
            this.fxGraphics.fillCircle(px, py, Math.max(1.4, 2.8-i*0.07));
          }
        }

        drawScene() {
          this.bgGraphics.clear();
          this.fxGraphics.clear();

          this.bgGraphics.fillGradientStyle(0x1a0000, 0x1a0000, 0x2d1000, 0x2d1000, 1);
          this.bgGraphics.fillRect(0, 0, boardWidth, boardHeight);

          this.bgGraphics.lineStyle(1, 0xffd54f, 0.25);
          this.bgGraphics.strokeRect(2, 2, boardWidth-4, boardHeight-4);

          this.bgGraphics.fillStyle(0xffd54f, 0.12);
          this.bgGraphics.fillRect(0, shooterY - cfg.bubbleRadius*1.4, boardWidth, 1.5);

          for (let row=0; row<cfg.rows; row++)
            for (let col=0; col<cfg.cols; col++) {
              const id = this.grid[row]?.[col];
              if (!id) continue;
              const pos = getBubblePosition(row, col, cfg);
              const type = BUBBLE_MAP[id as BubbleId];
              if (!type) continue;
              this.bgGraphics.fillStyle(hexToPhaserColor(type.hex), 0.22);
              this.bgGraphics.fillCircle(pos.x, pos.y, cfg.bubbleRadius - 0.5);
              this.bgGraphics.lineStyle(1.2, hexToPhaserColor(type.light), 0.35);
              this.bgGraphics.strokeCircle(pos.x, pos.y, cfg.bubbleRadius - 0.5);
            }

          this.drawAimGuide();

          this.projectileTrail.forEach((tr) => {
            const type = BUBBLE_MAP[tr.color as BubbleId];
            if (!type) return;
            this.fxGraphics.fillStyle(hexToPhaserColor(type.hex), tr.life*1.6);
            this.fxGraphics.fillCircle(tr.x, tr.y, 2.5+tr.life*5);
          });

          if (this.status === 'ready') {
            const type = BUBBLE_MAP[this.currentColor as BubbleId];
            if (type) {
              const pulse = Math.sin(this.idlePulse) * 0.7;
              this.fxGraphics.fillStyle(hexToPhaserColor(type.hex), 0.28);
              this.fxGraphics.fillCircle(shooterX, shooterY, cfg.bubbleRadius + pulse);
              this.fxGraphics.lineStyle(1.5, hexToPhaserColor(type.light), 0.5);
              this.fxGraphics.strokeCircle(shooterX, shooterY, cfg.bubbleRadius + pulse);
            }
            if (this.shooterImg) this.shooterImg.setVisible(true);
          } else {
            if (this.shooterImg && !this.projectile) this.shooterImg.setVisible(false);
          }

          if (this.projectile) {
            const type = BUBBLE_MAP[this.projectile.color as BubbleId];
            if (type) {
              this.fxGraphics.fillStyle(hexToPhaserColor(type.hex), 0.25);
              this.fxGraphics.fillCircle(this.projectile.x, this.projectile.y, cfg.bubbleRadius);
            }
          }

          const nextX = boardWidth - cfg.bubbleRadius * 1.6;
          const nextType = BUBBLE_MAP[this.nextColor as BubbleId];
          if (nextType) {
            this.fxGraphics.fillStyle(hexToPhaserColor(nextType.hex), 0.22);
            this.fxGraphics.fillCircle(nextX, shooterY, cfg.bubbleRadius * 0.75);
            this.fxGraphics.lineStyle(1, hexToPhaserColor(nextType.light), 0.35);
            this.fxGraphics.strokeCircle(nextX, shooterY, cfg.bubbleRadius * 0.75);
          }
          this.fxGraphics.fillStyle(0xffd54f, 0.9);
          this.fxGraphics.fillCircle(nextX, shooterY, 2);

          this.popEffects.forEach((fx) => {
            const type = BUBBLE_MAP[fx.color as BubbleId];
            const c = type ? hexToPhaserColor(type.light) : 0xffffff;
            this.fxGraphics.fillStyle(c, Math.max(0, fx.life/fx.maxLife));
            this.fxGraphics.fillCircle(fx.x, fx.y, 2+(1-fx.life/fx.maxLife)*4.5);
          });

          this.fallingBubbles.forEach((item) => {
            const type = BUBBLE_MAP[item.color as BubbleId];
            const c = type ? hexToPhaserColor(type.hex) : 0xff6655;
            const alpha = Math.max(0.2, item.life/1.2);
            this.fxGraphics.fillStyle(c, alpha);
            this.fxGraphics.fillCircle(item.x, item.y, item.size);
            if (type) {
              this.fxGraphics.lineStyle(1, hexToPhaserColor(type.light), alpha * 0.6);
              this.fxGraphics.strokeCircle(item.x, item.y, item.size);
            }
          });

          const statusLabel =
            this.status === 'ready' ? '待命' :
            this.status === 'shooting' ? '发射中' :
            this.status === 'won' ? '🎉 胜利' : '💀 失败';
          this.hudText.setText(`${statusLabel}  |  得分 ${this.score}  |  发射 ${this.shots}`);

          if (this.status === 'won' || this.status === 'lost') {
            this.fxGraphics.fillStyle(0x000000, 0.55);
            this.fxGraphics.fillRect(0, 0, boardWidth, boardHeight);
            this.overlayText
              .setText(this.status === 'won' ? '岁岁有龙\n恭喜通关！' : '游戏结束\n点击重新开始')
              .setVisible(true);
          } else {
            this.overlayText.setVisible(false);
          }
        }
      }

      const scene = new DragonBubbleScene();
      sceneRef.current = scene;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: boardWidth,
        height: boardHeight,
        backgroundColor: '#1a0000',
        scene,
        antialias: true,
        fps: { target: 60, forceSetTimeOut: false },
      });
    };

    /* ── 防抖重建 ──────────────────────────── */
    const scheduleBuild = () => {
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(buildGame, 150);
    };

    /* ── 初始化：加载 Phaser 后建游戏 ─────── */
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
      {/* 游戏画布区域：居中展示 */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden min-h-0"
      >
        <div ref={hostRef} style={{ borderRadius: 10, overflow: 'hidden' }} />
      </div>

      {/* 底部操作栏 */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-2 px-4">
        <button
          type="button"
          onClick={() => sceneRef.current?.events?.emit('external-restart')}
          className="rounded-lg bg-red-800 px-4 py-1.5 text-sm font-bold text-yellow-300 shadow
                     hover:bg-red-700 active:scale-95 transition-all border border-yellow-600/40"
        >
          重新开始
        </button>
        <span className="text-xs text-red-300/60">消除 3 个以上同色龙泡泡得分</span>
      </div>
    </div>
  );
}

export default ArknightsBubbleShooter;
