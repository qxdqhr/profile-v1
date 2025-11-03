import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '米库说话',
  description: '米库说话 - 类似会说话的汤姆猫的MMD互动游戏',
}

export default function MikuTalkingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

