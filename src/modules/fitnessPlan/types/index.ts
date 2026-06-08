import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  dailyCheckins,
  fitnessProfiles,
} from '../db/schema';

export type FitnessProfile = InferSelectModel<typeof fitnessProfiles>;
export type NewFitnessProfile = InferInsertModel<typeof fitnessProfiles>;
export type DailyCheckin = InferSelectModel<typeof dailyCheckins>;

export type FitnessGoal =
  | 'muscle_gain'
  | 'fat_loss'
  | 'maintain'
  | 'strength'
  | 'endurance';

export type ExerciseType = 'strength' | 'cardio';

export type WorkoutPlanStatus = 'active' | 'archived';

export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type CheckinType = 'daily' | 'workout' | 'diet' | 'weight';

export interface CheckinTodayState {
  daily: boolean;
  workout: boolean;
  diet: boolean;
  weight: boolean;
}

export interface FitnessProfileFormData {
  goal?: FitnessGoal;
  currentWeight?: number | null;
  weightUnit?: 'kg' | 'lb';
  dailyCalorieGoal?: number;
}

export interface ActiveWorkoutState {
  sessionId: number | null;
  startedAt: string | null;
}

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  muscle_gain: '增肌',
  fat_loss: '减脂',
  maintain: '维持',
  strength: '力量',
  endurance: '耐力',
};

export const CHECKIN_TYPE_LABELS: Record<CheckinType, string> = {
  daily: '综合日打卡',
  workout: '训练打卡',
  diet: '饮食打卡',
  weight: '体重打卡',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

export interface FitnessNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

export const FITNESS_NAV_ITEMS: FitnessNavItem[] = [
  { id: 'today', label: '今日', href: '/testField/fitnessPlan' },
  { id: 'plans', label: '计划', href: '/testField/fitnessPlan/plans' },
  { id: 'schedule', label: '日历', href: '/testField/fitnessPlan/schedule' },
  { id: 'workout', label: '训练', href: '/testField/fitnessPlan/workout' },
  { id: 'diet', label: '饮食', href: '/testField/fitnessPlan/diet' },
  { id: 'checkin', label: '打卡', href: '/testField/fitnessPlan/checkin' },
  { id: 'stats', label: '统计', href: '/testField/fitnessPlan/stats' },
  { id: 'settings', label: '设置', href: '/testField/fitnessPlan/settings' },
];

export const FITNESS_MOBILE_NAV_ITEMS: FitnessNavItem[] = [
  { id: 'today', label: '今日', href: '/testField/fitnessPlan' },
  { id: 'plans', label: '计划', href: '/testField/fitnessPlan/plans' },
  { id: 'checkin', label: '打卡', href: '/testField/fitnessPlan/checkin' },
  { id: 'diet', label: '饮食', href: '/testField/fitnessPlan/diet' },
  { id: 'more', label: '更多', href: '/testField/fitnessPlan/settings' },
];

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseProfileNumbers(profile: FitnessProfile) {
  return {
    ...profile,
    currentWeight:
      profile.currentWeight != null ? Number(profile.currentWeight) : null,
  };
}

export interface ExerciseRecord {
  id: number;
  userId: number | null;
  name: string;
  type: ExerciseType;
  bodyPart: string | null;
  equipment: string | null;
  cardioType: string | null;
  description: string | null;
  isCustom: boolean;
}

export interface ExerciseFormData {
  name: string;
  type: ExerciseType;
  bodyPart?: string;
  equipment?: string;
  cardioType?: string;
  description?: string;
}

export interface PlanItemInput {
  exerciseId?: number;
  exerciseName?: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  restSeconds?: number;
  targetDurationMinutes?: number;
  targetDistance?: number;
  targetCalories?: number;
}

export interface WorkoutPlanRecord {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  goalTags: string[];
  status: WorkoutPlanStatus;
  isTemplate: boolean;
  sourceTemplateId: number | null;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanItemRecord extends PlanItemInput {
  id: number;
  planId: number;
  sortOrder: number;
  exercise?: ExerciseRecord;
}

export interface WorkoutPlanDetail extends WorkoutPlanRecord {
  items: WorkoutPlanItemRecord[];
}

export interface WorkoutPlanFormData {
  name: string;
  description?: string;
  goalTags?: string[];
}

export const BODY_PART_LABELS: Record<string, string> = {
  chest: '胸',
  back: '背',
  legs: '腿',
  shoulder: '肩',
  arms: '臂',
  core: '核心',
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: '力量',
  cardio: '有氧',
};
