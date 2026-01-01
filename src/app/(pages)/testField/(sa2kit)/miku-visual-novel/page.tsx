'use client';

/**
 * MMD视觉小说演示页面
 * 
 * 🎨 新特性：支持FX效果文件！
 * - 使用 fxPath 指定.fx效果文件
 * - 使用 fxTexturePath 指定纹理基础路径
 * - 可以与renderEffect: 'outline'共存
 * 
 * ❌ 已移除：
 * - toonOptions (改用FX文件)
 * - bloomOptions (改用FX文件)
 * - renderEffect: 'bloom' (已移除)
 * - renderEffect: 'outline+bloom' (已移除)
 */

import React from 'react';
import {
  MMDVisualNovel,
  VisualNovelScript,
  DialogueBoxTheme,
  MMDStage,
} from 'sa2kit/mmd';


const OSS_BASE_PATH = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com'
const CDN_BASE_PATH = 'https://cdn.qhr062.top'
const YYB_Z6SakuraMiku = `${CDN_BASE_PATH}/mmd/model/YYB_Z6SakuraMiku/miku.pmx`
const YAGI39_MikuNT = `${CDN_BASE_PATH}/mmd/model/yagi39mikuNT/yagi39mikuNT.pmx`
const STAGE_1_PATH = `${CDN_BASE_PATH}/mmd/stages/xushi/场景主体.pmx`
const STAGE_2_PATHS = [
  `${CDN_BASE_PATH}/mmd/stages/zhimeng/场景主体.pmx`,
  `${CDN_BASE_PATH}/mmd/stages/zhimeng/吊饰.pmx`,
  `${CDN_BASE_PATH}/mmd/stages/zhimeng/地板追加.pmx`
]
const MOTION_1_PATH = `${CDN_BASE_PATH}/mmd/motion/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`
const MOTION_2_PATH = `${CDN_BASE_PATH}/mmd/motion/CatchTheWave/mmd_CatchTheWave_motion.vmd`
const AUDIO_1_PATH = `${CDN_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`

const DEFAULT_STAGE: MMDStage = {
  renderEffect: 'outline',
  outlineOptions: {
    thickness: 0.001,
    color: '#FFFFFF'
  },
  fxConfigs: [
    // Layer 1: 场景基础渲染 (.x文件)
    {
      path: `${CDN_BASE_PATH}/mmd/effects/SSAO/SSAO.x`,
      type: 'x',
      priority: 0,
      target: 'all',
      description: 'SSAO场景全局光照'
    },
   
     // Layer 2: PAToon着色器基础 (.fx文件，应用到全部)
     {
      path: `${CDN_BASE_PATH}/mmd/effects/SSAO/SSAO.fx`,
      type: 'fx',
      priority: 10,
      target: 'model',
      description: 'SSAO模型效果'
    },
  
    // Layer 2: PAToon着色器基础 (.fx文件，应用到全部)
    {
      path: `${CDN_BASE_PATH}/mmd/effects/PAToon/PAToon_シェーダー_標準.fx`,
      texturePath: `${CDN_BASE_PATH}/mmd/effects/PAToon`,
      type: 'fx',
      priority: 20,
      target: 'model',
      description: 'PAToon着色器基础'
    },
    
    // Layer 3: PAToon模型效果 (.fx文件，仅模型)
    {
      path: `${CDN_BASE_PATH}/mmd/effects/PAToon/PAToon_モデル_標準.fx`,
      texturePath: `${CDN_BASE_PATH}/mmd/effects/PAToon`,
      type: 'fx',
      priority: 30,
      target: 'model',
      description: 'PAToon模型卡通渲染'
    },
  ],
  ambientLightIntensity: 1.6,
  directionalLightIntensity: 1.2,
}
// 剧本配置 - 采用 v1.6.1 新格式
const exampleScript: VisualNovelScript = {
  id: 'demo-script-1',
  name: 'Miku Ciallo~',
  nodes: [
    {
      id: 'node-1',
      name: '开场',
      resources: {
        modelPath: YAGI39_MikuNT,
        motionPath: MOTION_1_PATH,
        stageModelPath: STAGE_2_PATHS,
      },
      loopAnimation: true,
      stage: DEFAULT_STAGE,
      dialogues: [
        {
          id: 'dialogue-1-1',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '大家好！我是初音未来！',
          typeSpeed: 40,
        },
        {
          id: 'dialogue-1-2',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '今天天气真好呢，我心情也很愉快！',
          typeSpeed: 40,
        },
        {
          id: 'dialogue-1-3',
          text: '（初音未来向你挥了挥手）',
          typeSpeed: 60,
          // 🎯 触发全屏闪白特效
          effect: { type: 'flash', color: 'white', duration: 500 }
        },
        {
          id: 'dialogue-1-4',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '你今天有什么想听的歌曲吗？我可以为你演唱哦！',
          typeSpeed: 40,
          // 🎯 新格式：在对话行中直接插入分支
          choices: [
            {
              text: "想听你唱歌！",
              // 仅仅设置变量，不触发立即跳转
              setVariable: { key: "player_choice", value: "sing" },
              // 🎯 点击选项后触发特效
              effect: { type: 'flash', color: '#39C5BB', duration: 300 },
              onSelect: () => console.log("玩家选择了听歌")
            },
            {
              text: "只想陪你聊聊天",
              setVariable: { key: "player_choice", value: "chat" },
              onSelect: () => console.log("玩家选择了聊天")
            }
          ]
        },
        {
          id: 'dialogue-1-5',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '嗯嗯，我知道了！那接下来...',
          typeSpeed: 40,
        },
      ],
      // 🎯 新格式：节点结束时根据之前存储的变量进行判定跳转
      nextCondition: {
        key: "player_choice",
        map: {
          "sing": 1, // 跳转到“演唱准备”节点 (Node 2)
          "chat": 2  // 跳转到“结束”节点 (Node 3)
        },
        defaultIndex: 1 // 默认去听歌
      }
    },
    {
      id: 'node-2',
      name: '演唱准备',
      resources: {
        modelPath: YAGI39_MikuNT,
        motionPath: MOTION_2_PATH,
        audioPath: AUDIO_1_PATH,
        stageModelPath: STAGE_2_PATHS,
      },
      loopAnimation: true,
      // 🎯 演唱环节使用FX效果文件（PAToon卡通渲染）
      stage: DEFAULT_STAGE,
      // 🎉 启用应援功能！
      supportCheer: true,
      dialogues: [
        {
          id: 'dialogue-2-1',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '好的！那我来准备一下...',
          typeSpeed: 40,
        },
        {
          id: 'dialogue-2-3',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '嗯嗯~准备好了！让我为你带来一首《CatchTheWave》！点击右下角的应援按钮为我加油吧！',
          typeSpeed: 40,
          // 🎯 开始唱歌前闪烁一下
          effect: { type: 'flash', color: 'white', duration: 1000 }
        },
      ],
    },
    {
      id: 'node-3',
      name: '结束',
      resources: {
        modelPath: YAGI39_MikuNT,
        motionPath: MOTION_1_PATH,
        stageModelPath: STAGE_1_PATH,
      },
      loopAnimation: true,
      // 🎯 回到普通描边模式
      stage: DEFAULT_STAGE,
      dialogues: [
        {
          id: 'dialogue-3-1',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '虽然只是聊了会儿天，但我也很开心哦！',
          typeSpeed: 40,
        },
        {
          id: 'dialogue-3-2',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '下次再见吧！拜拜~',
          typeSpeed: 40,
        },
      ],
    },
  ],
  loop: true,
};

// 舞台配置（全局默认配置）
const stageConfig: MMDStage = {
  backgroundColor: '#1a1a2e',
  enablePhysics: true,
  physicsPath: `${CDN_BASE_PATH}/mmd/libs/ammo.wasm.js`,
  enableShadow: true,
  ambientLightIntensity: 1,
  directionalLightIntensity: 0.8,
  cameraPosition: { x: 0, y: 15, z: 30 },
  cameraTarget: { x: 0, y: 10, z: 0 },
};

// 对话框主题
const customTheme: DialogueBoxTheme = {
  backgroundColor: 'rgba(10, 10, 30, 0.95)',
  borderColor: 'rgba(57, 197, 187, 0.6)',
  textColor: '#22c55e', // 亮绿色文字
  speakerBgColor: 'rgba(57, 197, 187, 0.9)',
  speakerTextColor: '#22c55e', // 亮绿色文字
  opacity: 1.0, // 使用完全不透明，透明度由 backgroundColor 的 alpha 控制
  blur: '12px',
  continueHint: '▼ 点击继续',
  showContinueHint: true,
};

export default function VisualNovelExample() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <MMDVisualNovel
        script={exampleScript}
        stage={stageConfig}
        dialogueTheme={customTheme}
        autoStart={false}
        showDebugInfo={false}
        showSkipButton={true}
        showAutoButton={true}
        showHistoryButton={true}
        onScriptComplete={() => {
          console.log('[Demo] 剧本播放完成！');
        }}
        onError={(error) => {
          console.error('[Demo] 错误:', error);
        }}
        className="w-full h-full"
      />
    </div>
  );
}

/**
 * 🎨 FX效果文件配置示例
 * 
 * ════════════════════════════════════════════════════════════════
 * 单FX模式（简单）
 * ════════════════════════════════════════════════════════════════
 * 
 * 示例1: 使用单个.fx文件
 * stage: {
 *   fxPath: '/effects/PAToon_モデル_標準.fx',
 *   fxTexturePath: '/effects/PAToon/',
 * }
 * 
 * ════════════════════════════════════════════════════════════════
 * 多FX模式（高级） - 推荐！
 * ════════════════════════════════════════════════════════════════
 * 
 * 示例2: 场景级(.x) + 模型级(.fx)组合
 * stage: {
 *   fxConfigs: [
 *     // 🌍 场景基础（.x文件，全局渲染）
 *     {
 *       path: '/effects/scene_lighting.x',
 *       type: 'x',
 *       priority: -10,  // 低优先级，先应用
 *       target: 'all',
 *       description: '场景光照系统'
 *     },
 *     // 🎨 模型效果（.fx文件，仅模型）
 *     {
 *       path: '/effects/PAToon_モデル_標準.fx',
 *       texturePath: '/effects/PAToon/',
 *       type: 'fx',
 *       priority: 0,     // 正常优先级
 *       target: 'model',
 *       description: 'PAToon卡通渲染'
 *     }
 *   ]
 * }
 * 
 * 示例3: PAToon完整效果（着色器 + 模型）
 * stage: {
 *   fxConfigs: [
 *     {
 *       path: '/effects/PAToon/PAToon_シェーダー_標準.fx',
 *       texturePath: '/effects/PAToon/',
 *       type: 'fx',
 *       priority: -5,
 *       target: 'all',
 *       description: 'PAToon着色器基础'
 *     },
 *     {
 *       path: '/effects/PAToon/PAToon_モデル_標準.fx',
 *       texturePath: '/effects/PAToon/',
 *       type: 'fx',
 *       priority: 0,
 *       target: 'model',
 *       description: 'PAToon模型效果'
 *     }
 *   ]
 * }
 * 
 * 示例4: 多层次渲染（场景 + 模型 + 细节）
 * stage: {
 *   fxConfigs: [
 *     // 场景基础
 *     { path: '/effects/env.x', type: 'x', priority: -10, target: 'all' },
 *     // 后期处理
 *     { path: '/effects/post.x', type: 'x', priority: -5, target: 'scene' },
 *     // 模型主效果
 *     { path: '/effects/PAToon.fx', type: 'fx', priority: 0, target: 'model' },
 *     // 边缘光
 *     { path: '/effects/rim_light.fx', type: 'fx', priority: 10, target: 'model' }
 *   ]
 * }
 * 
 * ════════════════════════════════════════════════════════════════
 * 文件类型说明
 * ════════════════════════════════════════════════════════════════
 * 
 * 🌍 .x 文件（场景级）:
 *   - 渲染整个环境，包括模型、舞台、光照等
 *   - 优先级建议: -10 到 -5（作为基础效果）
 *   - 目标建议: 'all' 或 'scene'
 * 
 * 🎨 .fx 文件（模型级）:
 *   - 应用到特定模型或部件
 *   - 优先级建议: 0 到 10（作为细节效果）
 *   - 目标建议: 'model' 或 'stage'
 * 
 * ════════════════════════════════════════════════════════════════
 * 优先级规则
 * ════════════════════════════════════════════════════════════════
 * 
 * -10: 场景基础渲染 (.x)
 *  -5: 场景增强/后期 (.x or .fx)
 *   0: 模型基础效果 (.fx)
 *   5: 模型增强效果 (.fx)
 *  10: 细节特效 (.fx)
 * 
 * 数字越小越先应用，越大越后应用（高优先级覆盖低优先级）
 * 
 * ════════════════════════════════════════════════════════════════
 * 📚 更多信息
 * ════════════════════════════════════════════════════════════════
 * 
 * - 多FX使用指南: src/mmd/fx/MULTI_FX_USAGE.md
 * - FX解析器文档: src/mmd/fx/README.md
 * - MMD集成文档: src/mmd/FX_MMD_INTEGRATION.md
 * - 快速参考: MMD_FX_QUICK_REFERENCE.md
 * - 多FX演示页面: http://localhost:3000/multi-fx-demo
 */

