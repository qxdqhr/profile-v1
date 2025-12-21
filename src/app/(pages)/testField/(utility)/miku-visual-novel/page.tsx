'use client';

import React from 'react';
import {
  MMDVisualNovel,
  VisualNovelScript,
  DialogueBoxTheme,
  MMDStage,
} from 'sa2kit/mmd';

const OSS_BASE_PATH = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com'
const YYB_Z6SakuraMiku = `${OSS_BASE_PATH}/mmd/2025/11/25/YYB_Z6SakuraMiku/miku.pmx`

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
        motionPath: `${OSS_BASE_PATH}/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`,
      },
      loopAnimation: true,
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
        motionPath: `${OSS_BASE_PATH}/mmd-motions/2025/12/10/mmd_CatchTheWave_motion.vmd`,
        audioPath: `/mikutalking/motions/CatchTheWave/pv_268.wav`
      },
      loopAnimation: true,
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
        },
      ],
    },
    {
      id: 'node-3',
      name: '结束',
      resources: {
        modelPath: YYB_Z6SakuraMiku,
        motionPath: `${OSS_BASE_PATH}/mmd-motions/2025/12/10/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`,
      },
      loopAnimation: true,
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
  ambientLightIntensity: 0.6,
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

