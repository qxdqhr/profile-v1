import { NextResponse } from 'next/server';

// 简易后端示例：返回已映射URL的播放列表配置
// 实际场景应替换为数据库查询 + 文件ID→URL映射逻辑

const OSS_BASE = 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd';

const demoPlaylist = {
  id: 'demo',
  name: 'MMD Demo 播放列表（后端配置）',
  loop: true,
  preload: 'next' as const,
  autoPlay: true,
  nodes: [
    {
      id: 'node-1',
      name: '场景 1 - 打招呼',
      duration: 10,
      modelUrl: `${OSS_BASE}/2025/11/25/erusa-sailor-swim/erusa-sailor-swim.pmx`,
      motionUrl: '/mikutalking/actions/打招呼.vmd',
    },
    {
      id: 'node-2',
      name: '场景 2 - 本地Miku',
      duration: 12,
      modelUrl: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
      motionUrl: '/mikutalking/actions/打招呼.vmd',
    },
  ],
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // 简单根据 id 返回 demo 配置，可扩展为数据库查询
  if (params.id !== 'demo') {
    return NextResponse.json({ error: 'playlist not found' }, { status: 404 });
  }

  return NextResponse.json(demoPlaylist);
}
