'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ARMode, MMDARPlayer } from 'sa2kit/mmd';
import type {
  MMDARPlayerRef,
  ModelPreset,
  MotionPreset,
  AudioPreset
} from 'sa2kit/mmd';

const CDN_BIGFILE_BASE_PATH = 'https://cdn.bigfile.qhr062.top';
const HIRO_PATTERN_URL = 'https://raw.githack.com/AR-js-org/AR.js/master/three.js/data/patt.hiro';
const NFT_DESCRIPTORS_URL =
  'https://raw.githack.com/AR-js-org/AR.js/master/aframe/examples/image-tracking/nft/trex/trex-image/trex';
const NFT_TARGET_IMAGE_URL =
  'https://raw.githubusercontent.com/AR-js-org/AR.js/master/aframe/examples/image-tracking/nft/trex-image-big.jpeg';

const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'yyb-sakura',
    name: 'YYB Sakura Miku',
    modelPath: `${CDN_BIGFILE_BASE_PATH}/mmd/model/YYB_Z6SakuraMiku/miku.pmx`
  },
  {
    id: 'yagi39',
    name: 'Yagi39 Miku NT',
    modelPath: `${CDN_BIGFILE_BASE_PATH}/mmd/model/yagi39mikuNT1/yagi39mikuNT.pmx`
  }
];

const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'idle',
    name: 'Idle',
    motionPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/132dfca3-fe65-430d-850c-4e0c293c4ea4.vmd`
  },
  {
    id: 'dance',
    name: 'Catch The Wave',
    motionPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/mmd_CatchTheWave_motion.vmd`
  }
];

const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'none',
    name: 'No Audio',
    audioPath: ''
  },
  {
    id: 'ctw',
    name: 'Catch The Wave',
    audioPath: `${CDN_BIGFILE_BASE_PATH}/mmd/motion/CatchTheWave/pv_268.wav`
  }
];

export default function MMDARTestPage() {
  const playerRef = useRef<MMDARPlayerRef>(null);
  const [arMode, setArMode] = useState<ARMode>(ARMode.WorldFixed);
  const [status, setStatus] = useState('等待初始化...');
  const [snapshotUrl, setSnapshotUrl] = useState<string>('');
  const [customModelUrl, setCustomModelUrl] = useState('');
  const [customMotionUrl, setCustomMotionUrl] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [markerType, setMarkerType] = useState<'pattern' | 'nft'>('nft');
  const [descriptorsUrl, setDescriptorsUrl] = useState(NFT_DESCRIPTORS_URL);

  const modeLabel = useMemo(
    () => (arMode === ARMode.WorldFixed ? 'World Fixed' : 'Overlay'),
    [arMode]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold md:text-2xl">MMD AR 测试页面</h1>
          <Link
            href="/examples/"
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            返回首页
          </Link>
        </div>

        <div className="mb-4 grid gap-2 text-xs text-zinc-200 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            说明：首次进入会请求摄像头权限，并加载 AR.js 与 MMD 资源。
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            模式：当前为 {modeLabel}，可在播放器设置面板切换。
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            状态：{status}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="h-[65vh] min-h-[480px] overflow-hidden rounded-xl border border-white/10 bg-black">
            <MMDARPlayer
              ref={playerRef}
              modelPresets={MODEL_PRESETS}
              motionPresets={MOTION_PRESETS}
              audioPresets={AUDIO_PRESETS}
              defaultModelId="yyb-sakura"
              defaultMotionId="idle"
              defaultAudioId="none"
              placementText="放置模型"
              cameraConfig={{ facingMode: 'environment' }}
              markerPlacementMode="follow-marker"
              markerConfig={
                markerType === 'nft'
                  ? {
                      type: 'nft',
                      descriptorsUrl: descriptorsUrl.trim()
                    }
                  : {
                      type: 'pattern',
                      patternUrl: HIRO_PATTERN_URL
                    }
              }
              arMode={arMode}
              autoPlay={true}
              loop={true}
              onLoad={() => setStatus('模型资源加载完成')}
              onModelPlaced={() => setStatus('模型已放置')}
              onARModeChange={(mode) => {
                setArMode(mode);
                setStatus(`AR 模式切换为 ${mode}`);
              }}
              onCameraReady={() => setStatus('摄像头已就绪')}
              onCameraError={(error) => setStatus(`摄像头错误: ${error.message}`)}
              onError={(error) => setStatus(`加载失败: ${error.message}`)}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">调试操作</h2>
            <div className="space-y-2 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-300">图像识别配置</p>
              <select
                value={markerType}
                onChange={(event) => setMarkerType(event.target.value as 'pattern' | 'nft')}
                className="w-full rounded-md border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
              >
                <option value="nft">NFT（识别图片自动放置）</option>
                <option value="pattern">Pattern（Hiro 标记）</option>
              </select>
              {markerType === 'nft' ? (
                <>
                  <input
                    className="w-full rounded-md border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="NFT descriptorsUrl（不带 .fset/.iset/.fset3 后缀）"
                    value={descriptorsUrl}
                    onChange={(event) => setDescriptorsUrl(event.target.value)}
                  />
                  <a
                    className="block text-xs text-emerald-300 underline"
                    href={NFT_TARGET_IMAGE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开示例识别图（对准此图触发自动放置）
                  </a>
                </>
              ) : (
                <a
                  className="block text-xs text-emerald-300 underline"
                  href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/three.js/data/hiro.png"
                  target="_blank"
                  rel="noreferrer"
                >
                  打开 Hiro 标记图（对准此图触发）
                </a>
              )}
            </div>
            <div className="space-y-2 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-300">动态资源 URL</p>
              <input
                className="w-full rounded-md border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                placeholder="模型 URL (.pmx)"
                value={customModelUrl}
                onChange={(event) => setCustomModelUrl(event.target.value)}
              />
              <input
                className="w-full rounded-md border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                placeholder="动作 URL (.vmd，可选)"
                value={customMotionUrl}
                onChange={(event) => setCustomMotionUrl(event.target.value)}
              />
              <input
                className="w-full rounded-md border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                placeholder="音频 URL (可选)"
                value={customAudioUrl}
                onChange={(event) => setCustomAudioUrl(event.target.value)}
              />
              <button
                className="w-full rounded-md bg-cyan-600 px-3 py-2 text-sm hover:bg-cyan-500"
                onClick={() => {
                  if (!customModelUrl.trim()) {
                    setStatus('请先填写模型 URL');
                    return;
                  }
                  playerRef.current?.switchModel({
                    modelPath: customModelUrl.trim(),
                    motionPath: customMotionUrl.trim() || undefined,
                    audioPath: customAudioUrl.trim() || undefined
                  });
                  setStatus('已应用自定义资源 URL');
                }}
              >
                应用 URL
              </button>
              <button
                className="w-full rounded-md bg-zinc-600 px-3 py-2 text-sm hover:bg-zinc-500"
                onClick={() => {
                  playerRef.current?.switchModel({
                    modelPath: MODEL_PRESETS[0].modelPath,
                    motionPath: MOTION_PRESETS[0].motionPath
                  });
                  setStatus('已恢复默认预设资源');
                }}
              >
                恢复预设
              </button>
            </div>
            <button
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
              onClick={() => {
                playerRef.current?.placeModel();
                setStatus('手动触发放置模型');
              }}
            >
              放置模型
            </button>
            <button
              className="w-full rounded-md bg-orange-600 px-3 py-2 text-sm hover:bg-orange-500"
              onClick={() => {
                playerRef.current?.removeModel();
                setStatus('已重置模型位置');
              }}
            >
              重置模型
            </button>
            <button
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500"
              onClick={async () => {
                await playerRef.current?.switchCamera();
                setStatus('已切换摄像头');
              }}
            >
              切换摄像头
            </button>
            <button
              className="w-full rounded-md bg-violet-600 px-3 py-2 text-sm hover:bg-violet-500"
              onClick={() => {
                const nextMode =
                  playerRef.current?.getARMode() === ARMode.WorldFixed
                    ? ARMode.Overlay
                    : ARMode.WorldFixed;
                playerRef.current?.setARMode(nextMode);
                setArMode(nextMode);
              }}
            >
              切换 AR 模式
            </button>
            <button
              className="w-full rounded-md bg-zinc-700 px-3 py-2 text-sm hover:bg-zinc-600"
              onClick={async () => {
                const dataUrl = await playerRef.current?.snapshot();
                if (dataUrl) {
                  setSnapshotUrl(dataUrl);
                  setStatus('已生成截图');
                }
              }}
            >
              截图
            </button>

            {snapshotUrl ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-300">截图预览</p>
                <img
                  src={snapshotUrl}
                  alt="AR snapshot"
                  className="w-full rounded-md border border-white/10"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
