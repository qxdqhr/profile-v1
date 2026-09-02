'use client';

import Link from 'next/link';
import { ProfileButton } from 'sa2kit';
import type { ProfileData } from 'sa2kit';

const profileData: ProfileData = {
  name: 'AR 测试用户',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  title: 'MMD AR Tester',
  bio: '用于验证 Profile 组件与 AR 锚定图片说明页联动。',
  contacts: {
    邮箱: 'ar-test@example.com',
    电话: '138-0000-0000'
  },
  badges: [
    { label: 'Profile', type: 'primary' },
    { label: 'AR', type: 'success' },
    { label: 'NFT Marker', type: 'info' }
  ],
  stats: [
    { label: '测试次数', value: 12 },
    { label: '成功识别', value: 9 },
    { label: '成功率', value: '75%' }
  ]
};

export default function ProfileTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Profile 组件测试页</h1>
          <Link
            href="/examples/"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-white"
          >
            返回首页
          </Link>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            这里用于测试 `ProfileButton` 组件，并提供 AR 锚定图片（NFT）接入说明子路由。
          </p>

          <div className="flex flex-wrap gap-3">
            <ProfileButton data={profileData} buttonText="打开 Profile 弹窗" modalTheme="blue" />
            <Link
              href="/examples/profile-test/ar-anchor-guide"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500"
            >
              打开 AR 锚定图片接入说明
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
