'use client';

/**
 * MMD视觉小说 - 带模型选择器演示页面
 * 
 * 这个示例展示了如何使用 MMDVisualNovelWithSelector 组件，
 * 在设置界面中提供人物模型和场景模型的下拉选择器。
 * 
 * 🎯 核心功能：
 * - 设置界面中的人物模型下拉选择
 * - 设置界面中的场景模型下拉选择
 * - 选择的模型会应用到所有场景节点
 */

import React from 'react';
import {
  MMDVisualNovelWithSelector,
  VisualNovelScript,
  DialogueBoxTheme,
  MMDStage,
  ModelOption,
} from 'sa2kit/mmd';

// CDN 路径配置
const CDN_BIGFILE_BASE_PATH = 'https://cdn.bigfile.qhr062.top';

// ============================================
// 🎭 人物模型列表
// ============================================
const CHARACTER_MODELS: ModelOption[] = [
  {
    id: 'yyb-sakura-miku',
    name: 'YYB 樱花初音',
    path: `${CDN_BIGFILE_BASE_PATH}/mmd/model/YYB_Z6SakuraMiku/miku.pmx`,
  },
  {
    id: 'yagi39-miku-nt',
    name: 'yagi39 初音NT',
    path: `${CDN_BIGFILE_BASE_PATH}/mmd/model/yagi39mikuNT1/yagi39mikuNT.pmx`,
  },
];

// ============================================
// 🌍 场景模型列表
// ============================================
const STAGE_MODELS: ModelOption[] = [
  {
    id: 'xushi-stage',
    name: '叙事场景',
    path: `${CDN_BIGFILE_BASE_PATH}/mmd/stages/xushi/场景主体.pmx`,
  },
  {
    id: 'zhimeng-stage',
    name: '治梦场景',
    path: [
      `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/场景主体.pmx`,
      `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/吊饰.pmx`,
      `${CDN_BIGFILE_BASE_PATH}/mmd/stages/zhimeng/地板追加.pmx`,
    ],
  },
];

// 动作路径
const MOTION_1_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`;
const MOTION_2_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/mmd_CatchTheWave_motion.vmd`;
const AUDIO_1_PATH = `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`;

// ============================================
// 📜 剧本配置
// ============================================
// 注意：这里的 modelPath 和 stageModelPath 会被模型选择器覆盖
const exampleScript: VisualNovelScript = {
  id: 'demo-script-selector',
  name: '初音未来的一天',
  nodes: [
    {
      id: 'node-1',
      name: '开场',
      resources: {
        // 这些路径会被选择器覆盖
        modelPath: '',
        motionPath: MOTION_1_PATH,
        stageModelPath: '',
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
          effect: { type: 'flash', color: 'white', duration: 500 },
        },
        {
          id: 'dialogue-1-4',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '你今天有什么想听的歌曲吗？我可以为你演唱哦！',
          typeSpeed: 40,
          choices: [
            {
              text: '想听你唱歌！',
              setVariable: { key: 'player_choice', value: 'sing' },
              effect: { type: 'flash', color: '#39C5BB', duration: 300 },
            },
            {
              text: '只想陪你聊聊天',
              setVariable: { key: 'player_choice', value: 'chat' },
            },
          ],
        },
        {
          id: 'dialogue-1-5',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '嗯嗯，我知道了！那接下来...',
          typeSpeed: 40,
        },
      ],
      nextCondition: {
        key: 'player_choice',
        map: {
          sing: 1,
          chat: 2,
        },
        defaultIndex: 1,
      },
    },
    {
      id: 'node-2',
      name: '演唱准备',
      resources: {
        modelPath: '',
        motionPath: MOTION_2_PATH,
        audioPath: AUDIO_1_PATH,
        stageModelPath: '',
      },
      loopAnimation: true,
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
          id: 'dialogue-2-2',
          speaker: '初音未来',
          speakerColor: '#39C5BB',
          text: '嗯嗯~准备好了！让我为你带来一首《CatchTheWave》！点击右下角的应援按钮为我加油吧！',
          typeSpeed: 40,
          effect: { type: 'flash', color: 'white', duration: 1000 },
        },
      ],
    },
    {
      id: 'node-3',
      name: '结束',
      resources: {
        modelPath: '',
        motionPath: MOTION_1_PATH,
        stageModelPath: '',
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
  loop: true,
};

// 舞台配置（全局默认配置）
const stageConfig: MMDStage = {
  enablePhysics: true,
  physicsPath: `${CDN_BIGFILE_BASE_PATH}/mmd/libs/ammo.wasm.js`,
  cameraPosition: { x: 0, y: 15, z: 30 },
  cameraTarget: { x: 0, y: 10, z: 0 },
};

// 对话框主题
const customTheme: DialogueBoxTheme = {
  backgroundColor: 'rgba(10, 10, 30, 0.95)',
  borderColor: 'rgba(57, 197, 187, 0.6)',
  textColor: '#22c55e',
  speakerBgColor: 'rgba(57, 197, 187, 0.9)',
  speakerTextColor: '#22c55e',
  opacity: 1.0,
  blur: '12px',
  continueHint: '▼ 点击继续',
  showContinueHint: true,
};

export default function VisualNovelSelectorExample() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <MMDVisualNovelWithSelector
        script={exampleScript}
        stage={stageConfig}
        dialogueTheme={customTheme}
        autoStart={false}
        showDebugInfo={false}
        showSkipButton={true}
        showAutoButton={true}
        showHistoryButton={true}
        // 🎯 模型选择器配置
        modelSelector={{
          characterModels: CHARACTER_MODELS,
          stageModels: STAGE_MODELS,
          defaultCharacterId: 'yagi39-miku-nt',
          defaultStageId: 'zhimeng-stage',
          characterLabel: '角色模型',
          stageLabel: '场景模型',
        }}
        onModelSelectionChange={(characterId, stageId) => {
          console.log('[Demo] 模型选择变化:', { characterId, stageId });
        }}
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

