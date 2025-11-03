/**
 * 动画配置常量
 */

import type { AnimationConfig, AnimationType, BodyPart } from '../types'

/** 动画配置映射表 */
export const ANIMATIONS: Record<AnimationType, AnimationConfig> = {
  idle: {
    type: 'idle',
    name: '待机',
    loop: true,
    priority: 0,
  },
  happy: {
    type: 'happy',
    name: '开心',
    duration: 3,
    priority: 5,
  },
  excited: {
    type: 'excited',
    name: '兴奋',
    duration: 4,
    priority: 6,
  },
  shy: {
    type: 'shy',
    name: '害羞',
    duration: 3,
    priority: 5,
  },
  angry: {
    type: 'angry',
    name: '生气',
    duration: 3,
    priority: 5,
  },
  sad: {
    type: 'sad',
    name: '难过',
    duration: 3,
    priority: 5,
  },
  surprised: {
    type: 'surprised',
    name: '惊讶',
    duration: 2,
    priority: 6,
  },
  dance: {
    type: 'dance',
    name: '跳舞',
    duration: 8,
    loop: true,
    priority: 7,
  },
  wave: {
    type: 'wave',
    name: '挥手',
    duration: 2,
    priority: 4,
  },
  nod: {
    type: 'nod',
    name: '点头',
    duration: 1.5,
    priority: 3,
  },
  shake_head: {
    type: 'shake_head',
    name: '摇头',
    duration: 1.5,
    priority: 3,
  },
  laugh: {
    type: 'laugh',
    name: '大笑',
    duration: 3,
    priority: 6,
  },
  cry: {
    type: 'cry',
    name: '哭泣',
    duration: 4,
    priority: 5,
  },
  sleep: {
    type: 'sleep',
    name: '睡觉',
    loop: true,
    priority: 2,
  },
  eat: {
    type: 'eat',
    name: '吃东西',
    duration: 3,
    priority: 5,
  },
  play: {
    type: 'play',
    name: '玩耍',
    duration: 5,
    priority: 6,
  },
  think: {
    type: 'think',
    name: '思考',
    duration: 3,
    priority: 4,
  },
  custom: {
    type: 'custom',
    name: '自定义',
    priority: 8,
  },
}

/** 身体部位对应的动画映射 */
export const BODY_PART_ANIMATIONS: Record<BodyPart, AnimationType[]> = {
  head: ['nod', 'shake_head', 'think', 'surprised'],
  face: ['happy', 'shy', 'laugh', 'surprised', 'angry'],
  body: ['dance', 'excited', 'happy', 'shy'],
  leftArm: ['wave', 'excited', 'happy'],
  rightArm: ['wave', 'excited', 'happy'],
  leftLeg: ['dance', 'play'],
  rightLeg: ['dance', 'play'],
  none: ['idle'],
}

/** 随机待机动画列表 */
export const IDLE_ANIMATIONS: AnimationType[] = [
  'idle',
  'think',
  'nod',
  'wave',
]

/** 情绪对应的动画 */
export const EMOTION_ANIMATIONS = {
  neutral: ['idle', 'think'],
  happy: ['happy', 'laugh', 'dance', 'wave'],
  excited: ['excited', 'dance', 'laugh'],
  sad: ['sad', 'cry'],
  angry: ['angry', 'shake_head'],
  tired: ['sleep'],
  hungry: ['sad', 'think'],
  bored: ['idle', 'think', 'nod'],
} as const

