'use client';

import React from 'react';
import {
  MMDVisualNovel,
  VisualNovelScript,
  DialogueBoxTheme,
  MMDStage,
} from 'sa2kit/mmd';

const OSS_BASE_PATH = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com'
const CDN_BASE_PATH = 'https://cdn.qhr062.top'
const YYB_Z6SakuraMiku = `${CDN_BASE_PATH}/mmd/2025/11/25/YYB_Z6SakuraMiku/miku.pmx`
const STAGE_1_PATH = `${CDN_BASE_PATH}/mmd/stages/zhimeng/场景主体.pmx`
const STAGE_2_PATHS = `${CDN_BASE_PATH}/mmd/stages/xushi/场景主体.pmx`
const STAGE_3_PATHS = [
  `${CDN_BASE_PATH}/mmd/stages/场景主体.pmx`,
  `${CDN_BASE_PATH}/mmd/stages/吊饰.pmx`,
  `${CDN_BASE_PATH}/mmd/stages/地板追加.pmx`
]

// 剧本配置 - 采用 v1.6.1 新格式
const exampleScript: VisualNovelScript = {
  id: 'demo-script-1',
  name: '初音未来的一天',
  nodes: [
    {
      id: 'node-1',
      name: '开场',
      resources: {
        modelPath: YYB_Z6SakuraMiku,
        motionPath: `${CDN_BASE_PATH}/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`,
        stageModelPath: STAGE_1_PATH,
      },
      loopAnimation: true,
      // 🎯 使用多FX文件配置
      stage: {
        // renderEffect: 'outline',  // 描边可以与FX共存
        // outlineOptions: {
        //   thickness: 0.005,
        //   color: '#000000'
        // },
        // 🌟 多FX配置：同时应用场景级和模型级效果
        fxConfigs: [
          // Layer 1: 场景基础渲染 (.x文件)
          {
            path: '/mikutalking/effects/SSAO/SSAO.x',
            type: 'x',
            priority: 0,
            target: 'all',
            description: 'SSAO场景全局光照'
          },
         
           // Layer 2: PAToon着色器基础 (.fx文件，应用到全部)
           {
            path: '/mikutalking/effects/SSAO/SSAO.fx',
            type: 'fx',
            priority: 10,
            target: 'model',
            description: 'SSAO模型效果'
          },

          // Layer 2: PAToon着色器基础 (.fx文件，应用到全部)
          {
            path: '/mikutalking/effects/PAToon/PAToon_シェーダー_標準.fx',
            texturePath: '/mikutalking/effects/PAToon/',
            type: 'fx',
            priority: 20,
            target: 'model',
            description: 'PAToon着色器基础'
          },
          
          // Layer 3: PAToon模型效果 (.fx文件，仅模型)
          {
            path: '/mikutalking/effects/PAToon/PAToon_モデル_標準.fx',
            texturePath: '/mikutalking/effects/PAToon/',
            type: 'fx',
            priority: 30,
            target: 'model',
            description: 'PAToon模型卡通渲染'
          },
        ],
        // 🎯 建议：灯光强度略微调高，环境光增强
        ambientLightIntensity: 1.6,
        directionalLightIntensity: 1.2,
      },
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
        modelPath: YYB_Z6SakuraMiku,
        // motionPath: `${CDN_BASE_PATH}/mmd-motions/2025/12/10/mmd_CatchTheWave_motion.vmd`,
        motionPath: `${CDN_BASE_PATH}/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`,
        // audioPath: `/mikutalking/motions/CatchTheWave/pv_268.wav`,
        stageModelPath: STAGE_2_PATHS,
      },
      loopAnimation: true,
      // 🎯 演唱环节使用FX效果文件（PAToon卡通渲染）
      stage: {
        // renderEffect: 'outline',
        // outlineOptions: {
        //   thickness: 0.005,
        //   color: '#000000'
        // },
        // // 🎨 使用FX效果文件替代toonOptions
        // fxPath: '/mikutalking/effects/PAToon/PAToon_モデル_標準.fx',  // PAToon模型标准版
        // fxTexturePath: '/effects/PAToon/',          // 纹理基础路径
        fxPath: '/mikutalking/effects/PAToon/PAToon_モデル_標準.fx',
        fxTexturePath: '/mikutalking/effects/PAToon/',
        // 🎯 建议：灯光强度略微调高，环境光增强
        ambientLightIntensity: 0.8,
        directionalLightIntensity: 0.6,
      },
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
          text: '嗯嗯~准备好了！让我为你带来一首《CatchTheWave》！',
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
        modelPath: YYB_Z6SakuraMiku,
        motionPath: `${CDN_BASE_PATH}/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`,
        stageModelPath: STAGE_1_PATH,
      },
      loopAnimation: true,
      // 🎯 回到普通描边模式
      stage: {
        renderEffect: 'outline',
        outlineOptions: { thickness: 0.004 }
      },
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
  loop: false,
};


// 舞台配置
const stageConfig: MMDStage = {
  backgroundColor: '#1a1a2e',
  enablePhysics: true,
  physicsPath: '/mikutalking/libs/ammo.wasm.js',
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
  textColor: '#ffffff',
  speakerBgColor: 'rgba(57, 197, 187, 0.9)',
  speakerTextColor: '#ffffff',
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

