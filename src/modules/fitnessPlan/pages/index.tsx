'use client';

import Link from 'next/link';
import { Button, Card, Title } from 'animal-island-ui';
import { ProfileSettingsForm } from '../components/ProfileSettingsForm';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';

export { PlansPage } from './PlansPage';
export { PlanDetailPage } from './PlanDetailPage';
export { SchedulePage } from './SchedulePage';
export { WorkoutListPage } from './WorkoutListPage';
export { WorkoutSessionPage } from './WorkoutSessionPage';
export { DietPage } from './DietPage';
export { TodayPage } from './TodayPage';
export { CheckinPage } from './CheckinPage';

function SubPageShell({
  title,
  color = 'app-teal',
  description,
  phase,
  actions,
}: {
  title: string;
  color?:
    | 'app-teal'
    | 'app-green'
    | 'app-yellow'
    | 'app-orange'
    | 'app-blue'
    | 'app-pink';
  description: string;
  phase: number;
  actions?: React.ReactNode;
}) {
  return (
    <div className="fp-page">
      <Title size="middle" color={color}>
        {title}
      </Title>
      <p className="fp-page__desc">{description}</p>
      {actions}
      <Card pattern="default" type="dashed">
        <p style={{ margin: 0, fontWeight: 600 }}>Phase {phase} 开发中</p>
        <p style={{ margin: '8px 0 0', color: '#9f927d', lineHeight: 1.6 }}>
          脚手架与路由已就绪，业务功能将在后续 Phase 实现。
        </p>
      </Card>
    </div>
  );
}

export function StatsPage() {
  return (
    <SubPageShell
      title="数据统计"
      color="app-teal"
      phase={7}
      description="训练容量趋势、PR 墙、部位分布与饮食热量曲线。"
    />
  );
}

export function SettingsPage() {
  const profileError = useFitnessPlanStore((s) => s.profileError);

  return (
    <div className="fp-page">
      <Title size="middle" color="app-teal">
        设置
      </Title>
      <p className="fp-page__desc">健身档案、体重与每日热量目标。</p>
      <ProfileSettingsForm />
      {profileError ? (
        <p style={{ color: '#e05a5a', margin: 0 }}>{profileError}</p>
      ) : null}
    </div>
  );
}
