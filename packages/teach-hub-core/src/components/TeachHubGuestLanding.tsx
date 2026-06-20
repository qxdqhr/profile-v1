'use client';

import { BookOpen, LogIn, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Button, Footer, Title } from 'animal-island-ui';
import {
  thGuestActions,
  thGuestFeatureIcon,
  thGuestFeatureItem,
  thGuestFeatureList,
  thGuestFeatureText,
  thGuestFeatureTitle,
  thGuestHero,
  thGuestHeroDesc,
  thGuestMain,
  thGuestPage,
  thGuestTopbar,
} from '../styles/tw';

const FEATURES = [
  {
    icon: Target,
    title: 'Mission 驱动学习',
    description: '用学习目标、成功标准与约束定义你的主题，Mimo 备课时会始终对齐你的动机。',
  },
  {
    icon: BookOpen,
    title: 'teach skill 原生课时',
    description: 'HTML 课时原样播放，保留测验与延伸阅读；内容存在你的专属工作区，而非平台课程库。',
  },
  {
    icon: Sparkles,
    title: '按需生成下一课',
    description: '完成当前课后，由你自主触发 Mimo 续备，自动生成课时与学习记录。',
  },
  {
    icon: TrendingUp,
    title: '进度与资源一体管理',
    description: '追踪完成状态、编辑 Mission 与学习记录，并将延伸阅读同步到资源列表。',
  },
] as const;

type TeachHubGuestLandingProps = {
  onLogin: () => void;
  onRegister: () => void;
};

export function TeachHubGuestLanding({ onLogin, onRegister }: TeachHubGuestLandingProps) {
  return (
    <div className={thGuestPage}>
      <header className={thGuestTopbar}>
        <Title size="small" color="app-teal">
          Teach 学习工作区
        </Title>
        <Button type="primary" size="small" onClick={onLogin}>
          <LogIn className="h-4 w-4" strokeWidth={2} />
          登录
        </Button>
      </header>

      <main className={thGuestMain}>
        <section className={thGuestHero}>
          <Title size="middle" color="app-teal">
            你的个人 teach skill 学习空间
          </Title>
          <p className={thGuestHeroDesc}>
            Teach 学习工作区是 teach skill 的多租户图形化壳：一用户、多工作区、自管进度、自触发续课。
            登录后即可创建主题、填写 Mission、学习 HTML 课时，并在完成每课后让 Mimo 为你备下一节。
          </p>

          <ul className={thGuestFeatureList}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className={thGuestFeatureItem}>
                  <span className={thGuestFeatureIcon} aria-hidden>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <p className={thGuestFeatureTitle}>{feature.title}</p>
                    <p className={thGuestFeatureText}>{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={thGuestActions}>
            <Button type="primary" onClick={onLogin}>
              <LogIn className="h-4 w-4" strokeWidth={2} />
              登录开始
            </Button>
            <Button type="default" onClick={onRegister}>
              注册账号
            </Button>
          </div>
        </section>
      </main>

      <Footer type="tree" />
    </div>
  );
}
