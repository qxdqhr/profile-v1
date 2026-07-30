// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';

const BASE_W = 375;
const BASE_H = 667;
const ASSET = (p: string) => `/images/flappyWish/${p}`;
const BEST_KEY = 'flappy_wish_best_by_diff_v1';

const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: '简单',
    hint: '缝更大 · 更慢',
    color: 0x3cb878,
    gravity: 0.36,
    flapImpulse: -7.2,
    maxFallSpeed: 9.5,
    hitboxScale: 0.55,
    pipeGap: 210,
    pipeSpeed: 1.9,
    pipeSpawnDistance: 240,
    bgScrollSpeed: 0.32,
    groundScrollSpeed: 1.9,
  },
  medium: {
    id: 'medium',
    label: '中等',
    hint: '均衡节奏',
    color: 0xff6b4a,
    gravity: 0.42,
    flapImpulse: -7.8,
    maxFallSpeed: 10.5,
    hitboxScale: 0.64,
    pipeGap: 170,
    pipeSpeed: 2.4,
    pipeSpawnDistance: 210,
    bgScrollSpeed: 0.4,
    groundScrollSpeed: 2.4,
  },
  hard: {
    id: 'hard',
    label: '困难',
    hint: '窄缝高速',
    color: 0xc44569,
    gravity: 0.48,
    flapImpulse: -8.2,
    maxFallSpeed: 11,
    hitboxScale: 0.72,
    pipeGap: 140,
    pipeSpeed: 2.8,
    pipeSpawnDistance: 190,
    bgScrollSpeed: 0.45,
    groundScrollSpeed: 2.8,
  },
};

const DIFF_ORDER = ['easy', 'medium', 'hard'];

function readBestMap() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      return {
        easy: Number(o.easy) || 0,
        medium: Number(o.medium) || 0,
        hard: Number(o.hard) || 0,
      };
    }
  } catch (_) {}
  return { easy: 0, medium: 0, hard: 0 };
}

function writeBest(diffId, score) {
  const map = readBestMap();
  const prev = map[diffId] || 0;
  const isNew = score > prev;
  if (isNew) {
    map[diffId] = score;
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(map));
    } catch (_) {}
  }
  return { best: isNew ? score : prev, isNewRecord: isNew };
}

function hasTex(scene, key) {
  return scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING';
}

export function FlappyWish() {
  const containerRef = useRef(null);
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    let mounted = true;
    let PhaserLib = null;
    let rebuildTimer = null;
    let observer = null;

    const buildGame = () => {
      if (!mounted || !PhaserLib || !containerRef.current || !hostRef.current) return;

      const cW = containerRef.current.clientWidth;
      const cH = containerRef.current.clientHeight;
      if (cW < 80 || cH < 80) return;

      // 忽略微小尺寸抖动，避免反复销毁重建
      const prev = lastSizeRef.current;
      if (Math.abs(prev.w - cW) < 8 && Math.abs(prev.h - cH) < 8 && gameRef.current) return;
      lastSizeRef.current = { w: cW, h: cH };

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
      hostRef.current.innerHTML = '';

      const Phaser = PhaserLib;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const fit = Math.min(cW / BASE_W, cH / BASE_H, 2);
      const viewW = Math.max(1, Math.round(BASE_W * fit));
      const viewH = Math.max(1, Math.round(BASE_H * fit));
      const gameW = Math.max(1, Math.round(viewW * dpr));
      const gameH = Math.max(1, Math.round(viewH * dpr));
      const S = (n) => n * fit * dpr;

      hostRef.current.style.width = `${viewW}px`;
      hostRef.current.style.height = `${viewH}px`;

      class FlappyScene extends Phaser.Scene {
        mode = 'title';
        diff = DIFFICULTIES.medium;
        score = 0;
        bestMap = readBestMap();
        player = null;
        pipes = [];
        bg = null;
        ground = null;
        groundY = 0;
        hintFrames = 0;
        flashFrames = 0;
        result = null;
        ui = [];
        loadFailed = [];

        constructor() {
          super({ key: 'FlappyScene' });
        }

        preload() {
          this.load.on('loaderror', (file) => {
            console.warn('[flappyWish] asset load failed:', file?.src || file?.key);
            this.loadFailed.push(file?.key || file?.src);
          });
          this.load.image('player', ASSET('player/avatar_e2.png'));
          this.load.image('bg', ASSET('bg/journey.jpg'));
          this.load.image('banner', ASSET('bg/banner_wish.jpg'));
          this.load.image('emoji_1', ASSET('fx/avg_1.png'));
          this.load.image('emoji_2', ASSET('fx/avg_2.png'));
          this.load.image('emoji_3', ASSET('fx/avg_3.png'));
          this.load.image('emoji_5', ASSET('fx/avg_5.png'));
          this.load.image('skill_1', ASSET('pipes/skill_1.png'));
          this.load.image('skill_2', ASSET('pipes/skill_2.png'));
          this.load.image('skill_3', ASSET('pipes/skill_3.png'));
          // 地面条纹纹理（生成，避免每帧 redraw）
          const g = this.make.graphics({ x: 0, y: 0, add: false });
          const tw = Math.max(8, Math.round(S(40)));
          const th = Math.max(8, Math.round(S(56)));
          g.fillStyle(0xd4b483, 1);
          g.fillRect(0, 0, tw, th);
          g.fillStyle(0xb8956a, 1);
          g.fillRect(0, 0, Math.round(tw / 2), Math.max(4, Math.round(S(8))));
          g.fillStyle(0x2a5f4a, 1);
          g.fillRect(0, 0, tw, Math.max(2, Math.round(S(3))));
          g.generateTexture('ground_tile', tw, th);
          g.destroy();
        }

        create() {
          this.groundY = gameH - S(56);
          this.cameras.main.setBackgroundColor('#7ec8e8');
          this.input.on('pointerdown', (p) => this.onPointer(p.x, p.y));
          this.events.on('external-restart', () => {
            if (this.mode === 'result' || this.mode === 'play') this.startPlay(this.diff.id);
            else this.showTitle();
          });
          this.showTitle();
        }

        clearUi() {
          this.ui.forEach((o) => {
            try {
              o.destroy();
            } catch (_) {}
          });
          this.ui = [];
        }

        clearWorld() {
          this.pipes.forEach((p) => {
            p.top?.destroy();
            p.bottom?.destroy();
            p.capTop?.destroy();
            p.capBot?.destroy();
            p.iconTop?.destroy();
            p.iconBot?.destroy();
          });
          this.pipes = [];
          this.bg?.destroy();
          this.bg = null;
          this.skyTint?.destroy();
          this.skyTint = null;
          this.ground?.destroy();
          this.ground = null;
          this.player?.destroy();
          this.player = null;
          this.scoreText?.destroy();
          this.scoreText = null;
          this.diffText?.destroy();
          this.diffText = null;
          this.hintText?.destroy();
          this.hintText = null;
          this.flashImg?.destroy();
          this.flashImg = null;
        }

        addUi(obj) {
          this.ui.push(obj);
          return obj;
        }

        showTitle() {
          this.mode = 'title';
          this.clearWorld();
          this.clearUi();
          this.bestMap = readBestMap();

          if (hasTex(this, 'banner')) {
            this.addUi(
              this.add.image(gameW / 2, gameH / 2, 'banner').setDisplaySize(gameW, gameH).setDepth(0)
            );
          } else {
            this.addUi(this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x7ec8e8).setDepth(0));
          }
          this.addUi(this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x0a1828, 0.45).setDepth(1));

          this.addUi(
            this.add
              .text(gameW / 2, S(72), '予愿飞翔', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(34))}px`,
                fontStyle: 'bold',
                color: '#ffffff',
              })
              .setOrigin(0.5)
              .setDepth(2)
          );
          this.addUi(
            this.add
              .text(gameW / 2, S(108), '选择难度 · 点按起飞', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(13))}px`,
                color: '#ffffffcc',
              })
              .setOrigin(0.5)
              .setDepth(2)
          );

          if (hasTex(this, 'player')) {
            const av = this.add
              .image(gameW / 2, S(200), 'player')
              .setDisplaySize(S(96), S(96))
              .setDepth(2);
            const maskG = this.make.graphics({ x: 0, y: 0, add: false });
            maskG.fillStyle(0xffffff);
            maskG.fillCircle(gameW / 2, S(200), S(48));
            av.setMask(maskG.createGeometryMask());
            this.addUi(av);
            this.addUi(
              this.add
                .circle(gameW / 2, S(200), S(49), 0xffffff, 0)
                .setStrokeStyle(Math.max(2, S(3)), 0xffffff, 0.85)
                .setDepth(3)
            );
          }

          const bm = this.bestMap;
          this.addUi(
            this.add
              .text(
                gameW / 2,
                S(275),
                `最高  简单 ${bm.easy}  ·  中等 ${bm.medium}  ·  困难 ${bm.hard}`,
                {
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: `${Math.round(S(12))}px`,
                  color: '#fffffff0',
                }
              )
              .setOrigin(0.5)
              .setDepth(2)
          );

          DIFF_ORDER.forEach((id, i) => {
            const d = DIFFICULTIES[id];
            const y = S(360) + i * S(62);
            const btn = this.add
              .rectangle(gameW / 2, y, S(230), S(50), d.color, 1)
              .setDepth(2)
              .setInteractive({ useHandCursor: true });
            btn.diffId = id;
            this.addUi(btn);
            this.addUi(
              this.add
                .text(gameW / 2, y - S(8), d.label, {
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: `${Math.round(S(18))}px`,
                  fontStyle: 'bold',
                  color: '#ffffff',
                })
                .setOrigin(0.5)
                .setDepth(3)
            );
            this.addUi(
              this.add
                .text(gameW / 2, y + S(12), `${d.hint} · 纪录 ${bm[id] || 0}`, {
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: `${Math.round(S(11))}px`,
                  color: '#ffffffe0',
                })
                .setOrigin(0.5)
                .setDepth(3)
            );
          });

          this.addUi(
            this.add
              .text(gameW / 2, gameH - S(24), '素材版权归鹰角网络 · 仅供同人学习', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(10))}px`,
                color: '#ffffffa0',
              })
              .setOrigin(0.5)
              .setDepth(2)
          );
        }

        startPlay(diffId) {
          this.diff = DIFFICULTIES[diffId] || DIFFICULTIES.medium;
          this.mode = 'play';
          this.score = 0;
          this.hintFrames = 90;
          this.flashFrames = 0;
          this.clearUi();
          this.clearWorld();

          if (hasTex(this, 'bg')) {
            const src = this.textures.get('bg').getSourceImage();
            const scaleY = gameH / (src.height || BASE_H);
            this.bg = this.add
              .tileSprite(0, 0, gameW, gameH, 'bg')
              .setOrigin(0, 0)
              .setTileScale(scaleY, scaleY)
              .setDepth(0);
          } else {
            this.bg = this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x7ec8e8).setDepth(0);
          }
          this.skyTint = this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x78bedc, 0.18).setDepth(1);

          this.ground = this.add
            .tileSprite(0, this.groundY, gameW, S(56), 'ground_tile')
            .setOrigin(0, 0)
            .setDepth(5);

          const size = S(52);
          if (hasTex(this, 'player')) {
            this.player = this.add.image(gameW * 0.28, gameH * 0.42, 'player').setDepth(10);
            this.player.setDisplaySize(size, size);
          } else {
            this.player = this.add.circle(gameW * 0.28, gameH * 0.42, size / 2, 0xff6b4a).setDepth(10);
          }
          this.player.vy = 0;
          this.player.alive = true;
          this.player.pw = size;
          this.player.ph = size;

          this.pipes = [];
          let x = gameW + S(40);
          for (let i = 0; i < 3; i++) {
            this.spawnPipe(x);
            x += S(this.diff.pipeSpawnDistance);
          }

          this.scoreText = this.add
            .text(gameW / 2, S(64), '0', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: `${Math.round(S(46))}px`,
              fontStyle: 'bold',
              color: '#ffffff',
              stroke: '#000000',
              strokeThickness: Math.max(2, S(4)),
            })
            .setOrigin(0.5)
            .setDepth(20);

          this.diffText = this.add
            .text(gameW / 2, S(96), this.diff.label, {
              fontFamily: 'system-ui, sans-serif',
              fontSize: `${Math.round(S(12))}px`,
              color: '#ffffffd9',
            })
            .setOrigin(0.5)
            .setDepth(20);

          this.hintText = this.add
            .text(gameW / 2, gameH * 0.35, '点按起飞', {
              fontFamily: 'system-ui, sans-serif',
              fontSize: `${Math.round(S(16))}px`,
              color: '#ffffffe6',
            })
            .setOrigin(0.5)
            .setDepth(20);
        }

        spawnPipe(x) {
          const gapH = S(this.diff.pipeGap);
          const margin = S(90);
          const min = margin + gapH / 2;
          const max = this.groundY - margin - gapH / 2;
          const gapY = min + Math.random() * Math.max(1, max - min);
          const w = S(64);
          const topH = gapY - gapH / 2;
          const bottomY = gapY + gapH / 2;
          const bottomH = this.groundY - bottomY;
          const color = 0x3d8b6e;
          const edge = 0x2a5f4a;

          const top = this.add.rectangle(x + w / 2, topH / 2, w, topH, color).setDepth(4);
          top.setStrokeStyle(Math.max(1, S(2)), edge);
          const bottom = this.add
            .rectangle(x + w / 2, bottomY + bottomH / 2, w, bottomH, color)
            .setDepth(4);
          bottom.setStrokeStyle(Math.max(1, S(2)), edge);
          const capTop = this.add
            .rectangle(x + w / 2, topH - S(9), w + S(8), S(18), color)
            .setDepth(4);
          capTop.setStrokeStyle(Math.max(1, S(2)), edge);
          const capBot = this.add
            .rectangle(x + w / 2, bottomY + S(9), w + S(8), S(18), color)
            .setDepth(4);
          capBot.setStrokeStyle(Math.max(1, S(2)), edge);

          const skillKey = `skill_${1 + Math.floor(Math.random() * 3)}`;
          const iconS = S(28);
          let iconTop = null;
          let iconBot = null;
          if (hasTex(this, skillKey)) {
            iconTop = this.add.image(x + w / 2, topH - S(9), skillKey).setDisplaySize(iconS, iconS).setDepth(5);
            iconBot = this.add.image(x + w / 2, bottomY + S(9), skillKey).setDisplaySize(iconS, iconS).setDepth(5);
          }

          this.pipes.push({
            x,
            w,
            gapY,
            gapH,
            scored: false,
            top,
            bottom,
            capTop,
            capBot,
            iconTop,
            iconBot,
            topH,
            bottomY,
            bottomH,
          });
        }

        repositionPipe(p) {
          const { x, w, topH, bottomY, bottomH } = p;
          p.top.setPosition(x + w / 2, topH / 2);
          p.bottom.setPosition(x + w / 2, bottomY + bottomH / 2);
          p.capTop.setPosition(x + w / 2, topH - S(9));
          p.capBot.setPosition(x + w / 2, bottomY + S(9));
          p.iconTop?.setPosition(x + w / 2, topH - S(9));
          p.iconBot?.setPosition(x + w / 2, bottomY + S(9));
        }

        onPointer(x, y) {
          if (this.mode === 'title') {
            for (const obj of this.ui) {
              if (
                obj.diffId &&
                obj.getBounds &&
                Phaser.Geom.Rectangle.Contains(obj.getBounds(), x, y)
              ) {
                this.startPlay(obj.diffId);
                return;
              }
            }
            return;
          }
          if (this.mode === 'play' && this.player?.alive) {
            this.player.vy = S(this.diff.flapImpulse);
            return;
          }
          if (this.mode === 'result') {
            for (const obj of this.ui) {
              if (
                obj.action === 'retry' &&
                obj.getBounds &&
                Phaser.Geom.Rectangle.Contains(obj.getBounds(), x, y)
              ) {
                this.startPlay(this.diff.id);
                return;
              }
              if (
                obj.action === 'title' &&
                obj.getBounds &&
                Phaser.Geom.Rectangle.Contains(obj.getBounds(), x, y)
              ) {
                this.showTitle();
                return;
              }
            }
          }
        }

        hitTest() {
          const p = this.player;
          const hs = this.diff.hitboxScale;
          const hw = p.pw * hs;
          const hh = p.ph * hs;
          const box = { x: p.x - hw / 2, y: p.y - hh / 2, w: hw, h: hh };
          if (box.y <= 0) return true;
          if (box.y + box.h >= this.groundY) return true;
          for (const pipe of this.pipes) {
            const topBox = { x: pipe.x, y: 0, w: pipe.w, h: pipe.topH };
            const botBox = { x: pipe.x, y: pipe.bottomY, w: pipe.w, h: pipe.bottomH };
            if (this.aabb(box, topBox) || this.aabb(box, botBox)) return true;
          }
          return false;
        }

        aabb(a, b) {
          return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        }

        die() {
          this.player.alive = false;
          const r = writeBest(this.diff.id, this.score);
          this.result = { score: this.score, ...r };
          this.showResult();
        }

        showResult() {
          this.mode = 'result';
          this.clearWorld();
          this.clearUi();
          const r = this.result || { score: 0, best: 0, isNewRecord: false };

          this.addUi(this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x7ec8e8, 1).setDepth(0));
          this.addUi(this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x142030, 0.55).setDepth(1));
          this.addUi(
            this.add.rectangle(gameW / 2, S(310), gameW - S(80), S(340), 0xffffff, 0.92).setDepth(2)
          );

          let emojiKey = 'emoji_5';
          if (r.isNewRecord || r.score >= 10) emojiKey = 'emoji_2';
          else if (r.score >= 5) emojiKey = 'emoji_1';
          else if (r.score >= 1) emojiKey = 'emoji_3';
          if (hasTex(this, emojiKey)) {
            this.addUi(
              this.add.image(gameW / 2, S(200), emojiKey).setDisplaySize(S(112), S(112)).setDepth(3)
            );
          }

          this.addUi(
            this.add
              .text(gameW / 2, S(290), r.isNewRecord ? '新纪录！' : '旅途暂停', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(22))}px`,
                fontStyle: 'bold',
                color: '#1a2a3a',
              })
              .setOrigin(0.5)
              .setDepth(3)
          );
          this.addUi(
            this.add
              .text(gameW / 2, S(322), `难度  ${this.diff.label}`, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(14))}px`,
                color: '#1a2a3a',
              })
              .setOrigin(0.5)
              .setDepth(3)
          );
          this.addUi(
            this.add
              .text(gameW / 2, S(350), `本局  ${r.score}`, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(16))}px`,
                color: '#1a2a3a',
              })
              .setOrigin(0.5)
              .setDepth(3)
          );
          this.addUi(
            this.add
              .text(gameW / 2, S(378), `本难度最高  ${r.best}`, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(16))}px`,
                color: '#1a2a3a',
              })
              .setOrigin(0.5)
              .setDepth(3)
          );

          const retry = this.add
            .rectangle(S(115), S(450), S(120), S(48), 0xff6b4a)
            .setDepth(3)
            .setInteractive({ useHandCursor: true });
          retry.action = 'retry';
          this.addUi(retry);
          this.addUi(
            this.add
              .text(S(115), S(450), '再来一次', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(16))}px`,
                fontStyle: 'bold',
                color: '#ffffff',
              })
              .setOrigin(0.5)
              .setDepth(4)
          );

          const title = this.add
            .rectangle(S(260), S(450), S(120), S(48), 0x4a6278)
            .setDepth(3)
            .setInteractive({ useHandCursor: true });
          title.action = 'title';
          this.addUi(title);
          this.addUi(
            this.add
              .text(S(260), S(450), '回标题', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${Math.round(S(16))}px`,
                fontStyle: 'bold',
                color: '#ffffff',
              })
              .setOrigin(0.5)
              .setDepth(4)
          );
        }

        update(_t, delta) {
          if (this.mode !== 'play' || !this.player?.alive) return;
          const dt = Math.min(2.5, delta / (1000 / 60));
          const d = this.diff;

          this.player.vy = Math.min(S(d.maxFallSpeed), this.player.vy + S(d.gravity) * dt);
          this.player.y += this.player.vy * dt;
          const t = Math.max(-1, Math.min(1, this.player.vy / S(d.maxFallSpeed)));
          if (this.player.setRotation) this.player.setRotation(t * 0.7);

          const sp = S(d.pipeSpeed) * dt;
          if (this.bg?.tilePositionX !== undefined) {
            this.bg.tilePositionX += S(d.bgScrollSpeed) * dt;
          }
          if (this.ground?.tilePositionX !== undefined) {
            this.ground.tilePositionX += S(d.groundScrollSpeed) * dt;
          }

          for (const pipe of this.pipes) {
            pipe.x -= sp;
            this.repositionPipe(pipe);
          }
          while (this.pipes.length && this.pipes[0].x + this.pipes[0].w < -10) {
            const dead = this.pipes.shift();
            dead.top.destroy();
            dead.bottom.destroy();
            dead.capTop.destroy();
            dead.capBot.destroy();
            dead.iconTop?.destroy();
            dead.iconBot?.destroy();
          }
          const last = this.pipes[this.pipes.length - 1];
          if (!last || last.x < gameW - S(d.pipeSpawnDistance)) {
            const nx = last ? last.x + S(d.pipeSpawnDistance) : gameW + S(40);
            this.spawnPipe(nx);
          }

          if (this.hitTest()) {
            this.die();
            return;
          }

          for (const pipe of this.pipes) {
            if (!pipe.scored && pipe.x + pipe.w / 2 < this.player.x) {
              pipe.scored = true;
              this.score += 1;
              this.scoreText.setText(String(this.score));
              this.flashFrames = 24;
              if (!this.flashImg && hasTex(this, 'emoji_2')) {
                this.flashImg = this.add
                  .image(gameW / 2, S(110), 'emoji_2')
                  .setDisplaySize(S(48), S(48))
                  .setDepth(21);
              }
            }
          }

          if (this.hintFrames > 0) {
            this.hintFrames -= dt;
            if (this.hintFrames <= 0 && this.hintText) this.hintText.setVisible(false);
          }
          if (this.flashFrames > 0) {
            this.flashFrames -= dt;
            if (this.flashImg) {
              this.flashImg.setAlpha(Math.min(1, this.flashFrames / 12));
              if (this.flashFrames <= 0) {
                this.flashImg.destroy();
                this.flashImg = null;
              }
            }
          }
        }
      }

      const scene = new FlappyScene();
      sceneRef.current = scene;
      gameRef.current = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: hostRef.current,
        width: gameW,
        height: gameH,
        backgroundColor: '#7ec8e8',
        scene,
        audio: { noAudio: true },
        render: {
          antialias: true,
          roundPixels: false,
          powerPreference: 'high-performance',
          mipmapFilter: 'LINEAR',
          pixelArt: false,
        },
        fps: {
          target: 60,
          min: 30,
          smoothStep: true,
          forceSetTimeOut: false,
        },
        callbacks: {
          postBoot: (game) => {
            const canvas = game.canvas;
            if (!canvas) return;
            canvas.style.width = `${viewW}px`;
            canvas.style.height = `${viewH}px`;
            canvas.style.display = 'block';
            canvas.style.imageRendering = 'auto';
          },
        },
      });
    };

    const scheduleBuild = () => {
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(buildGame, 180);
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
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      sceneRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden min-h-0 bg-[#0b1520]"
      >
        <div ref={hostRef} className="overflow-hidden rounded-lg shadow-lg" />
      </div>
      <div className="flex-shrink-0 flex items-center justify-center gap-4 py-2 px-4">
        <button
          type="button"
          onClick={() => sceneRef.current?.events?.emit('external-restart')}
          className="rounded-lg bg-purple-800 px-4 py-1.5 text-sm font-bold text-yellow-300
                     shadow hover:bg-purple-700 active:scale-95 transition-all border border-yellow-500/40"
        >
          重新开始
        </button>
        <span className="text-xs text-purple-300/60">点选难度开始 · 点按起飞穿管</span>
      </div>
    </div>
  );
}

export default FlappyWish;
