'use client';

import Link from 'next/link';
import { NapCatConsole } from 'sa2kit/qqbot/ui/web';

export default function QqbotNapCatDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">QQ Bot / NapCat Demo</h1>
          <p className="mt-2 text-sm text-slate-600">
            这个示例把 NapCat OneBot11 封装成 Web API，并提供一个网页控制台调用 action。
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>API 基路径: <code>/api/examples/qqbot</code></li>
            <li>健康检查: <code>GET /api/examples/qqbot/health</code></li>
            <li>通用 action: <code>POST /api/examples/qqbot/action/:action</code></li>
            <li>环境变量: <code>NAPCAT_HTTP_URL</code> / <code>NAPCAT_TOKEN</code></li>
          </ul>
          <div className="mt-4">
            <Link
              href="/examples/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              返回首页
            </Link>
          </div>
        </header>

        <NapCatConsole endpoint="/api/examples/qqbot" />
      </div>
    </main>
  );
}
