// 游戏基础配置
export const GAME_CONFIG = {
  GRID_SIZE: 8,
  GEM_SIZE: 60,
  MIN_MATCH: 3,
  SCORE_PER_GEM: 10,
  SPECIAL_GEM_CHANCE: 0.1 // 特殊宝石出现概率
} as const

// 宝石类型配置
export const GEMS = {
  RED: { type: 0, color: 0xff0000, name: 'red' },      // 纯红色
  GREEN: { type: 1, color: 0x00ff00, name: 'green' },  // 纯绿色
  BLUE: { type: 2, color: 0x0000ff, name: 'blue' },    // 纯蓝色
  YELLOW: { type: 3, color: 0xffff00, name: 'yellow' }, // 纯黄色
  PURPLE: { type: 4, color: 0x800080, name: 'purple' }, // 紫色
  ORANGE: { type: 5, color: 0xffa500, name: 'orange' }  // 橙色
} as const;

export type GemType = typeof GEMS[keyof typeof GEMS];


export const GEMS_SPECIAL = {
  HORIZONTAL_CLEAR: {
    id: 6,
    color: 0x00ffff,
    name: '横向消除',
    frame: 6,
    glow: true
  },
  VERTICAL_CLEAR: {
    id: 7,
    color: 0xff00ff,
    name: '纵向消除',
    frame: 7,
    glow: true
  },
  BOMB: {
    id: 8,
    color: 0xff4500,
    name: '爆炸宝石',
    frame: 8,
    glow: true
  },
  RAINBOW: {
    id: 9,
    color: 0xffffff,
    name: '彩虹宝石',
    frame: 9,
    glow: true,
    rainbow: true
  }
} as const

export const GEMS_SCORES = {
  NORMAL: 10,
  SPECIAL: 30,
  COMBO: 50
} as const

export const GEMS_EFFECTS = {
  HORIZONTAL_CLEAR: { range: 'row', score: 50 },
  VERTICAL_CLEAR: { range: 'column', score: 50 },
  BOMB: { range: 'area', radius: 2, score: 80 },
  RAINBOW: { range: 'color', score: 100 }
} as const

export const GEMS_ANIMATIONS = {
  GLOW: {
    duration: 1000,
    alpha: { start: 0.6, end: 1 },
    yoyo: true,
    repeat: -1
  },
  RAINBOW: {
    duration: 2000,
    tints: [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x800080],
    repeat: -1
  }
} as const

// 资源路径配置
export const ASSETS = {
  SPRITES: {
    GEMS: {
      key: 'gems',
      path: '/trible/images/gems.png',
      frameConfig: {
        frameWidth: 60,
        frameHeight: 60,
        startFrame: 0,
        endFrame: 9  // 包含所有普通和特殊宝石
      }
    }
  },
  IMAGES: {
    BACKGROUND: {
      key: 'background',
      path: '/trible/images/background.png'
    },
    BUTTON: {
      key: 'button',
      path: '/trible/images/button.png'
    }
  },
  AUDIO: {
    BGM: {
      key: 'bgm',
      path: '/trible/sounds/bgm.mp3',
      config: {
        volume: 0.5,
        loop: true
      }
    },
    EFFECTS: {
      MATCH: {
        key: 'match',
        path: '/trible/sounds/match.mp3'
      },
      SWAP: {
        key: 'swap',
        path: '/trible/sounds/swap.mp3'
      },
      SELECT: {
        key: 'select',
        path: '/trible/sounds/select.mp3'
      },
      SPECIAL: {
        key: 'special',
        path: '/trible/sounds/special.mp3'
      }
    }
  }
} as const

// 颜色配置
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'] as const

// 动画配置
export const ANIMATION = {
  SWAP_DURATION: 200,
  DROP_DURATION: 500,
  FILL_DELAY: 300,
  CHECK_DELAY: 600,
  SPECIAL_EFFECT_DURATION: 800,
  COMBO_DELAY: 200
} as const

// 样式配置
export const STYLES = {
  TITLE: {
    fontSize: '64px',
    color: '#ffffff',
    fontStyle: 'bold'
  },
  SCORE: {
    fontSize: '32px',
    color: '#ffffff'
  },
  BUTTON: {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#f44336',
    padding: { x: 15, y: 8 }
  },
  SETTINGS: {
    ON_COLOR: '#4CAF50',
    OFF_COLOR: '#f44336',
    BG_COLOR: '#333333'
  }
} as const

// 音频配置（移除旧的音频配置，使用ASSETS中的配置）
export const AUDIO = {
  BGM: {
    key: ASSETS.AUDIO.BGM.key,
    ...ASSETS.AUDIO.BGM.config
  },
  EFFECTS: {
    MATCH: ASSETS.AUDIO.EFFECTS.MATCH.key,
    SWAP: ASSETS.AUDIO.EFFECTS.SWAP.key,
    SELECT: ASSETS.AUDIO.EFFECTS.SELECT.key,
    SPECIAL: ASSETS.AUDIO.EFFECTS.SPECIAL.key
  }
} as const

// 存储键
export const STORAGE_KEY = 'tribleGameSettings' as const 