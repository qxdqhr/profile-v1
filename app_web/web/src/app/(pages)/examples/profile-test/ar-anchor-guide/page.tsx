'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

export default function ARAnchorGuidePage() {
  const [descriptorsUrl, setDescriptorsUrl] = useState(
    'https://your-cdn.com/ar/markers/my-target'
  );

  const snippet = useMemo(
    () =>
      `<MMDARPlayer
  arMode={ARMode.WorldFixed}
  markerPlacementMode="follow-marker"
  markerConfig={{
    type: 'nft',
    descriptorsUrl: '${descriptorsUrl.trim()}'
  }}
/>`,
    [descriptorsUrl]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">传入锚定图片（NFT）正确方式</h1>
          <Link
            href="/examples/profile-test"
            className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm hover:bg-zinc-700"
          >
            返回 Profile 测试页
          </Link>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900/70 p-6">
          <p className="text-sm text-zinc-300">
            不是直接传 `jpg/png`。AR.js 的 `nft` 需要先把图片转成 3 个描述文件：
          </p>

          <ul className="list-disc space-y-1 pl-6 text-sm text-zinc-200">
            <li>`xxx.fset`</li>
            <li>`xxx.fset3`</li>
            <li>`xxx.iset`</li>
          </ul>

          <p className="text-sm text-zinc-300">
            然后把不带后缀的前缀 URL 传给 `descriptorsUrl`，例如：
          </p>

          <input
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            value={descriptorsUrl}
            onChange={(event) => setDescriptorsUrl(event.target.value)}
            placeholder="https://your-cdn.com/ar/markers/my-target"
          />

          <pre className="overflow-x-auto rounded-md bg-black p-4 text-xs leading-6 text-emerald-300">
            {snippet}
          </pre>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            注意：`descriptorsUrl` 最终会请求
            `descriptorsUrl + .fset/.fset3/.iset`，资源需可访问且支持 CORS。
          </div>
        </div>
      </div>
    </div>
  );
}
