import Link from 'next/link';

const tools = [
  { href: '/qr-code', label: '二维码生成', description: '文本 / URL 转二维码，支持下载' },
  { href: '/date-calculator', label: '日期计算器', description: '日期间隔、加减与工作日估算' },
  { href: '/work-calculate', label: '工时统计', description: '按起止时间计算工作时长' },
  { href: '/image-downloader', label: '图片下载', description: '批量抓取网页图片' },
] as const;

export default function ToolsIndexPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">小工具</h1>
      <p className="mb-8 text-sm text-gray-600">常用 Web 工具集合，点击名称进入。</p>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block px-4 py-4 transition hover:bg-gray-50 sm:px-5"
            >
              <span className="font-medium text-blue-700 hover:underline">{tool.label}</span>
              <span className="mt-1 block text-sm text-gray-600">{tool.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
