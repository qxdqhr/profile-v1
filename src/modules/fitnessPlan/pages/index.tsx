'use client';

import Link from 'next/link';
import { Button, Card, Title } from 'animal-island-ui';
import { CHECKIN_TYPE_LABELS } from '../types';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';

interface SubPageShellProps {
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
}

export function SubPageShell({
  title,
  color = 'app-teal',
  description,
  phase,
  actions,
}: SubPageShellProps) {
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

export function TodayPage() {
  const checkinToday = useFitnessPlanStore((s) => s.checkinToday);
  const selectedDate = useFitnessPlanStore((s) => s.ui.selectedDate);
  const profile = useFitnessPlanStore((s) => s.profile);

  return (
    <div className="fp-page">
      <Title size="large" color="app-green">
        今日
      </Title>
      <p className="fp-page__desc">
        {selectedDate} · 目标：
        {profile?.goal === 'muscle_gain'
          ? '增肌'
          : profile?.goal === 'fat_loss'
            ? '减脂'
            : profile?.goal === 'strength'
              ? '力量'
              : profile?.goal === 'endurance'
                ? '耐力'
                : '维持'}
      </p>

      <div className="fp-grid-2">
        <Card pattern="app-teal">
          <Title size="small" color="app-teal">
            今日打卡
          </Title>
          <div className="fp-checkin-grid" style={{ marginTop: 12 }}>
            {(Object.keys(checkinToday) as Array<keyof typeof checkinToday>).map((key) => (
              <div
                key={key}
                className={`fp-checkin-item ${checkinToday[key] ? 'is-done' : 'is-pending'}`}
              >
                <span>{checkinToday[key] ? '✓' : '○'}</span>
                <span>{CHECKIN_TYPE_LABELS[key]}</span>
              </div>
            ))}
          </div>
          <Link href="/testField/fitnessPlan/checkin" style={{ marginTop: 12, display: 'inline-block' }}>
            <Button type="default" size="small">
              去打卡中心
            </Button>
          </Link>
        </Card>

        <Card pattern="app-yellow">
          <Title size="small" color="app-yellow">
            快捷入口
          </Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <Link href="/testField/fitnessPlan/workout">
              <Button type="primary" size="small">
                开始训练
              </Button>
            </Link>
            <Link href="/testField/fitnessPlan/diet">
              <Button type="default" size="small">
                记录饮食
              </Button>
            </Link>
            <Link href="/testField/fitnessPlan/schedule">
              <Button type="default" size="small">
                查看日历
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card pattern="default" type="dashed">
        <p style={{ margin: 0, fontWeight: 600 }}>Phase 6 将完善今日训练计划与饮食摘要</p>
      </Card>
    </div>
  );
}

export function PlansPage() {
  return (
    <SubPageShell
      title="训练计划"
      color="app-blue"
      phase={2}
      description="管理推拉腿、Upper/Lower 等计划模板与个人计划。"
      actions={
        <Link href="/testField/fitnessPlan/plans/new">
          <Button type="primary">新建计划（Phase 2）</Button>
        </Link>
      }
    />
  );
}

export function PlanDetailPage({ planId }: { planId: string }) {
  return (
    <SubPageShell
      title={`计划 #${planId}`}
      color="app-blue"
      phase={2}
      description="编排力量/有氧动作、组数、休息与目标参数。"
    />
  );
}

export function SchedulePage() {
  return (
    <SubPageShell
      title="训练日历"
      color="app-orange"
      phase={3}
      description="月视图排期，复制 calendar 组件并展示训练/饮食/打卡角标。"
    />
  );
}

export function WorkoutListPage() {
  return (
    <SubPageShell
      title="训练记录"
      color="app-green"
      phase={4}
      description="历史训练会话与空训练快速开练。"
      actions={
        <Button type="primary" disabled>
          空训练开练（Phase 4）
        </Button>
      }
    />
  );
}

export function WorkoutSessionPage({ sessionId }: { sessionId: string }) {
  return (
    <SubPageShell
      title={`训练 #${sessionId}`}
      color="app-green"
      phase={4}
      description="力量组记录、有氧时长、组间倒计时与完成打卡。"
    />
  );
}

export function DietPage() {
  return (
    <SubPageShell
      title="饮食记录"
      color="app-pink"
      phase={5}
      description="按日记录餐次、热量与饮食截图（不上线 OCR）。"
    />
  );
}

export function CheckinPage() {
  return (
    <SubPageShell
      title="打卡中心"
      color="app-yellow"
      phase={6}
      description="综合日打卡、训练/饮食/体重打卡与连续天数 streak。"
    />
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
  const profile = useFitnessPlanStore((s) => s.profile);
  const profileError = useFitnessPlanStore((s) => s.profileError);

  return (
    <div className="fp-page">
      <Title size="middle" color="app-teal">
        设置
      </Title>
      <p className="fp-page__desc">健身档案与每日热量目标（Phase 2 开放编辑表单）。</p>

      <Card pattern="app-teal">
        <dl style={{ margin: 0, display: 'grid', gap: 8 }}>
          <div>
            <dt style={{ fontSize: 12, color: '#9f927d' }}>健身目标</dt>
            <dd style={{ margin: '4px 0 0', fontWeight: 700 }}>{profile?.goal ?? '—'}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: '#9f927d' }}>每日热量目标</dt>
            <dd style={{ margin: '4px 0 0', fontWeight: 700 }}>
              {profile?.dailyCalorieGoal ?? '—'} kcal
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: '#9f927d' }}>当前体重</dt>
            <dd style={{ margin: '4px 0 0', fontWeight: 700 }}>
              {profile?.currentWeight != null
                ? `${profile.currentWeight} ${profile.weightUnit}`
                : '未设置'}
            </dd>
          </div>
        </dl>
        {profileError ? (
          <p style={{ margin: '12px 0 0', color: '#e05a5a' }}>{profileError}</p>
        ) : null}
      </Card>
    </div>
  );
}
