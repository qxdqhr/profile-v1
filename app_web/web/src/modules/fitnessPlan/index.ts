/**
 * 薄兼容层（Phase H1c）：实现已迁至 sa2kit/business/fitnessPlan。
 * 正式入口：/fitness-plan （@profile/fitness-plan）
 */
export {
  FitnessPlanLayout,
  TodayPage,
  PlansPage,
  PlanDetailPage,
  SchedulePage,
  WorkoutListPage,
  WorkoutSessionPage,
  DietPage,
  CheckinPage,
  StatsPage,
  SettingsPage,
  useFitnessPlanStore,
  useFitnessPlanBootstrap,
} from 'sa2kit/business/fitnessPlan/ui/web';
export type * from 'sa2kit/business/fitnessPlan/domain';
