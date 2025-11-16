/**
 * MMD 测试页面布局
 * 用于验证 SA2Kit MMD 功能
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MMD 功能测试 | SA2Kit',
  description: '测试和验证 SA2Kit MMD 库的各项功能',
}

export default function MMDTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

