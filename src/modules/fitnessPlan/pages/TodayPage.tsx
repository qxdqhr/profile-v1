'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Title } from 'animal-island-ui';
import { fitnessPlanClient } from '../services/fitnessPlanClient';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';
import type { CheckinType, TodayOverviewPayload } from '../types';
import { CHECKIN_TYPE_LABELS, FITNESS_GOAL_LABELS, formatDateKey } from '../types';
import type { FitnessGoal } from '../types';

const CHECKIN_ORDER: CheckinType[] = ['daily', 'workout', 'diet', 'weight'];

const CHECKIN_LINKS: Partial<Record<CheckinType, string>> = {
  daily: '/testField/fitnessPlan/checkin',
  workout: '/testField/fitnessPlan/workout',
  diet: '/testField/fitnessPlan/diet',
  weight: '/testField/fitnessPlan/checkin',
};

export function TodayPage() {
  const checkinToday = useFitnessPlanStore((s) => s.checkinToday);
  const setCheckinToday = useFitnessPlanStore((s) => s.setCheckinToday);
  const activeWorkout = useFitnessPlanStore((s) => s.activeWorkout);
  const selectedDate = useFitnessPlanStore((s) => s.ui.selectedDate);
  const profile = useFitnessPlanStore((s) => s.profile);

  const [overview, setOverview] = useState<TodayOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isToday = selectedDate === formatDateKey(new Date());
  const goalLabel = profile?.goal
    ? FITNESS_GOAL_LABELS[profile.goal as FitnessGoal] ?? profile.goal
    : '维持';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fitnessPlanClient.getTodayOverview(selectedDate);
      setOverview(data);
      if (isToday) {
        setCheckinToday(data.checkins);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [isToday, selectedDate, setCheckinToday]);

  useEffect(() => {
    void load();
  }, [load]);

  const workoutHref =
    overview?.activeSessionId != null
      ? `/testField/fitnessPlan/workout/${overview.activeSessionId}`
      : activeWorkout.sessionId != null
        ? `/testField/fitnessPlan/workout/${activeWorkout.sessionId}`
        : '/testField/fitnessPlan/workout';

  return (
    <div className="fp-page">
      <Title size="large" color="app-green">
        {isToday ? '今日' : '概览'}
      </Title>
      <p className="fp-page__desc">
        {selectedDate} · 目标：{goalLabel}
      </p>

      <Card pattern="app-teal">
        <div className="fp-quadrant-head">
          <Title size="small" color="app-teal">
            四象限打卡
          </Title>
          <strong className="fp-quadrant-head__score">
            {overview?.completedCount ?? 0}/4
          </strong>
        </div>
        <div className="fp-quadrant-grid">
          {CHECKIN_ORDER.map((key) => {
            const done = (overview?.checkins ?? checkinToday)[key];
            const href = CHECKIN_LINKS[key];
            const content = (
              <div className={`fp-quadrant-item ${done ? 'is-done' : 'is-pending'}`}>
                <span className="fp-quadrant-item__icon">{done ? '✓' : '○'}</span>
                <span className="fp-quadrant-item__label">{CHECKIN_TYPE_LABELS[key]}</span>
              </div>
            );
            return href ? (
              <Link key={key} href={href} className="fp-quadrant-link">
                {content}
              </Link>
            ) : (
              <div key={key}>{content}</div>
            );
          })}
        </div>
        <Link href="/testField/fitnessPlan/checkin" style={{ marginTop: 12, display: 'inline-block' }}>
          <Button type="default" size="small">
            去打卡中心
          </Button>
        </Link>
      </Card>

      <div className="fp-grid-2">
        <Card pattern="app-green">
          <Title size="small" color="app-green">
            今日训练
          </Title>
          {loading ? <p style={{ color: '#9f927d', marginTop: 12 }}>加载中…</p> : null}
          {!loading && overview?.schedule.isRest ? (
            <p style={{ marginTop: 12, color: '#8a7b66' }}>日历安排：休息日 🌿</p>
          ) : null}
          {!loading && overview?.schedule.planName ? (
            <p style={{ marginTop: 12, color: '#725d42', fontWeight: 600 }}>
              {overview.schedule.planName}
            </p>
          ) : null}
          {!loading && !overview?.schedule.isRest && !overview?.schedule.planName ? (
            <p style={{ marginTop: 12, color: '#9f927d' }}>今日尚未安排训练计划</p>
          ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <Link href={workoutHref}>
              <Button type="primary" size="small">
                {overview?.activeSessionId || activeWorkout.sessionId ? '继续训练' : '开始训练'}
              </Button>
            </Link>
            <Link href="/testField/fitnessPlan/schedule">
              <Button type="default" size="small">
                查看日历
              </Button>
            </Link>
          </div>
        </Card>

        <Card pattern="app-pink">
          <Title size="small" color="app-pink">
            今日饮食
          </Title>
          <p style={{ marginTop: 12, color: '#725d42' }}>
            已记录 {overview?.diet.entryCount ?? 0} 条饮食
          </p>
          <Link href="/testField/fitnessPlan/diet" style={{ marginTop: 12, display: 'inline-block' }}>
            <Button type="default" size="small">
              记录饮食
            </Button>
          </Link>
        </Card>
      </div>

      <Card pattern="app-yellow">
        <Title size="small" color="app-yellow">
          快捷入口
        </Title>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <Link href="/testField/fitnessPlan/plans">
            <Button type="default" size="small">
              训练计划
            </Button>
          </Link>
          <Link href="/testField/fitnessPlan/workout">
            <Button type="default" size="small">
              训练记录
            </Button>
          </Link>
          <Link href="/testField/fitnessPlan/checkin">
            <Button type="default" size="small">
              打卡中心
            </Button>
          </Link>
          <Link href="/testField/fitnessPlan/stats">
            <Button type="default" size="small">
              数据统计
            </Button>
          </Link>
        </div>
      </Card>

      {error ? <p style={{ color: '#e05a5a', margin: 0 }}>{error}</p> : null}
    </div>
  );
}
