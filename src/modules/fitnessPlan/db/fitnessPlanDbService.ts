import { db } from '@/db';
import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import systemExercises from '../data/systemExercises.json';
import { PLAN_TEMPLATES } from '../data/planTemplates';
import {
  dailyCheckins,
  exercises,
  fitnessProfiles,
  workoutPlanItems,
  workoutPlans,
} from './schema';
import type {
  CheckinTodayState,
  CheckinType,
  ExerciseFormData,
  ExerciseRecord,
  FitnessGoal,
  FitnessProfileFormData,
  PlanItemInput,
  WorkoutPlanDetail,
  WorkoutPlanFormData,
  WorkoutPlanRecord,
  WorkoutPlanStatus,
} from '../types';
import { formatDateKey } from '../types';

function mapExercise(row: typeof exercises.$inferSelect): ExerciseRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type as ExerciseRecord['type'],
    bodyPart: row.bodyPart,
    equipment: row.equipment,
    cardioType: row.cardioType,
    description: row.description,
    isCustom: row.userId != null,
  };
}

class FitnessPlanDbService {
  async ensureSystemExercisesSeeded() {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(exercises)
      .where(isNull(exercises.userId));

    if ((count ?? 0) > 0) {
      return;
    }

    await db.insert(exercises).values(
      systemExercises.map((item) => ({
        userId: null,
        name: item.name,
        type: item.type,
        bodyPart: item.bodyPart ?? null,
        equipment: item.equipment ?? null,
        cardioType: item.cardioType ?? null,
        description: item.description ?? null,
      })),
    );
  }

  async getOrCreateProfile(userId: number) {
    const existing = await db.query.fitnessProfiles.findFirst({
      where: eq(fitnessProfiles.userId, userId),
    });

    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(fitnessProfiles)
      .values({
        userId,
        goal: 'maintain',
        weightUnit: 'kg',
        dailyCalorieGoal: 2000,
      })
      .returning();

    return created;
  }

  async updateProfile(userId: number, data: FitnessProfileFormData) {
    await this.getOrCreateProfile(userId);

    const patch: Partial<typeof fitnessProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.goal) patch.goal = data.goal as FitnessGoal;
    if (data.weightUnit) patch.weightUnit = data.weightUnit;
    if (data.dailyCalorieGoal != null) patch.dailyCalorieGoal = data.dailyCalorieGoal;
    if (data.currentWeight !== undefined) {
      patch.currentWeight =
        data.currentWeight == null ? null : String(data.currentWeight);
    }

    const [updated] = await db
      .update(fitnessProfiles)
      .set(patch)
      .where(eq(fitnessProfiles.userId, userId))
      .returning();

    return updated;
  }

  async getTodayCheckins(userId: number, date = new Date()): Promise<CheckinTodayState> {
    const dateKey = formatDateKey(date);
    const rows = await db
      .select()
      .from(dailyCheckins)
      .where(
        and(eq(dailyCheckins.userId, userId), eq(dailyCheckins.checkinDate, dateKey)),
      );

    const state: CheckinTodayState = {
      daily: false,
      workout: false,
      diet: false,
      weight: false,
    };

    for (const row of rows) {
      const type = row.type as CheckinType;
      if (type in state) state[type] = true;
    }

    return state;
  }

  async listExercises(
    userId: number,
    filters: { search?: string; type?: string; bodyPart?: string } = {},
  ): Promise<ExerciseRecord[]> {
    await this.ensureSystemExercisesSeeded();

    const conditions = [or(isNull(exercises.userId), eq(exercises.userId, userId))];

    if (filters.type) conditions.push(eq(exercises.type, filters.type));
    if (filters.bodyPart) conditions.push(eq(exercises.bodyPart, filters.bodyPart));
    if (filters.search?.trim()) {
      conditions.push(ilike(exercises.name, `%${filters.search.trim()}%`));
    }

    const rows = await db
      .select()
      .from(exercises)
      .where(and(...conditions))
      .orderBy(asc(exercises.type), asc(exercises.name));

    return rows.map(mapExercise);
  }

  async createExercise(userId: number, data: ExerciseFormData) {
    const [created] = await db
      .insert(exercises)
      .values({
        userId,
        name: data.name.trim(),
        type: data.type,
        bodyPart: data.bodyPart ?? null,
        equipment: data.equipment ?? null,
        cardioType: data.cardioType ?? null,
        description: data.description ?? null,
      })
      .returning();

    return mapExercise(created);
  }

  async updateExercise(userId: number, exerciseId: number, data: ExerciseFormData) {
    const existing = await db.query.exercises.findFirst({
      where: and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)),
    });

    if (!existing) return null;

    const [updated] = await db
      .update(exercises)
      .set({
        name: data.name.trim(),
        type: data.type,
        bodyPart: data.bodyPart ?? null,
        equipment: data.equipment ?? null,
        cardioType: data.cardioType ?? null,
        description: data.description ?? null,
        updatedAt: new Date(),
      })
      .where(eq(exercises.id, exerciseId))
      .returning();

    return mapExercise(updated);
  }

  async deleteExercise(userId: number, exerciseId: number) {
    const existing = await db.query.exercises.findFirst({
      where: and(eq(exercises.id, exerciseId), eq(exercises.userId, userId)),
    });

    if (!existing) return false;

    await db.delete(exercises).where(eq(exercises.id, exerciseId));
    return true;
  }

  async listPlans(userId: number, status: WorkoutPlanStatus = 'active') {
    const rows = await db
      .select({
        id: workoutPlans.id,
        userId: workoutPlans.userId,
        name: workoutPlans.name,
        description: workoutPlans.description,
        goalTags: workoutPlans.goalTags,
        status: workoutPlans.status,
        isTemplate: workoutPlans.isTemplate,
        sourceTemplateId: workoutPlans.sourceTemplateId,
        createdAt: workoutPlans.createdAt,
        updatedAt: workoutPlans.updatedAt,
        itemCount: sql<number>`cast(count(${workoutPlanItems.id}) as int)`,
      })
      .from(workoutPlans)
      .leftJoin(workoutPlanItems, eq(workoutPlans.id, workoutPlanItems.planId))
      .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.status, status)))
      .groupBy(workoutPlans.id)
      .orderBy(desc(workoutPlans.updatedAt));

    return rows.map((row) => ({
      ...row,
      goalTags: row.goalTags ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })) as WorkoutPlanRecord[];
  }

  async getPlanDetail(userId: number, planId: number): Promise<WorkoutPlanDetail | null> {
    const plan = await db.query.workoutPlans.findFirst({
      where: and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)),
    });

    if (!plan) return null;

    const itemRows = await db
      .select({
        id: workoutPlanItems.id,
        planId: workoutPlanItems.planId,
        exerciseId: workoutPlanItems.exerciseId,
        sortOrder: workoutPlanItems.sortOrder,
        targetSets: workoutPlanItems.targetSets,
        targetReps: workoutPlanItems.targetReps,
        targetWeight: workoutPlanItems.targetWeight,
        restSeconds: workoutPlanItems.restSeconds,
        targetDurationMinutes: workoutPlanItems.targetDurationMinutes,
        targetDistance: workoutPlanItems.targetDistance,
        targetCalories: workoutPlanItems.targetCalories,
        exercise: exercises,
      })
      .from(workoutPlanItems)
      .innerJoin(exercises, eq(workoutPlanItems.exerciseId, exercises.id))
      .where(eq(workoutPlanItems.planId, planId))
      .orderBy(asc(workoutPlanItems.sortOrder), asc(workoutPlanItems.id));

    return {
      id: plan.id,
      userId: plan.userId,
      name: plan.name,
      description: plan.description,
      goalTags: plan.goalTags ?? [],
      status: plan.status as WorkoutPlanStatus,
      isTemplate: plan.isTemplate,
      sourceTemplateId: plan.sourceTemplateId,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      items: itemRows.map((row) => ({
        id: row.id,
        planId: row.planId,
        exerciseId: row.exerciseId,
        sortOrder: row.sortOrder,
        targetSets: row.targetSets ?? undefined,
        targetReps: row.targetReps ?? undefined,
        targetWeight: row.targetWeight != null ? Number(row.targetWeight) : undefined,
        restSeconds: row.restSeconds ?? undefined,
        targetDurationMinutes: row.targetDurationMinutes ?? undefined,
        targetDistance: row.targetDistance != null ? Number(row.targetDistance) : undefined,
        targetCalories: row.targetCalories ?? undefined,
        exercise: mapExercise(row.exercise),
      })),
    };
  }

  private async resolveExerciseId(userId: number, item: PlanItemInput) {
    if (item.exerciseId) return item.exerciseId;

    if (!item.exerciseName) {
      throw new Error('动作缺少 exerciseId 或 exerciseName');
    }

    await this.ensureSystemExercisesSeeded();
    const found = await db.query.exercises.findFirst({
      where: and(
        eq(exercises.name, item.exerciseName),
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
      ),
    });

    if (!found) throw new Error(`未找到动作：${item.exerciseName}`);
    return found.id;
  }

  private async insertPlanItems(planId: number, userId: number, items: PlanItemInput[]) {
    if (items.length === 0) return;

    const values = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const exerciseId = await this.resolveExerciseId(userId, item);
      values.push({
        planId,
        exerciseId,
        sortOrder: index,
        targetSets: item.targetSets ?? null,
        targetReps: item.targetReps ?? null,
        targetWeight: item.targetWeight != null ? String(item.targetWeight) : null,
        restSeconds: item.restSeconds ?? 90,
        targetDurationMinutes: item.targetDurationMinutes ?? null,
        targetDistance: item.targetDistance != null ? String(item.targetDistance) : null,
        targetCalories: item.targetCalories ?? null,
      });
    }

    await db.insert(workoutPlanItems).values(values);
  }

  async createPlan(userId: number, data: WorkoutPlanFormData, items: PlanItemInput[] = []) {
    const [plan] = await db
      .insert(workoutPlans)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        goalTags: data.goalTags ?? [],
        status: 'active',
      })
      .returning();

    await this.insertPlanItems(plan.id, userId, items);
    return this.getPlanDetail(userId, plan.id);
  }

  async updatePlan(userId: number, planId: number, data: Partial<WorkoutPlanFormData> & { status?: WorkoutPlanStatus }) {
    const existing = await db.query.workoutPlans.findFirst({
      where: and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)),
    });

    if (!existing) return null;

    const [updated] = await db
      .update(workoutPlans)
      .set({
        name: data.name?.trim() ?? existing.name,
        description:
          data.description !== undefined
            ? data.description?.trim() || null
            : existing.description,
        goalTags: data.goalTags ?? existing.goalTags,
        status: data.status ?? existing.status,
        updatedAt: new Date(),
      })
      .where(eq(workoutPlans.id, planId))
      .returning();

    return {
      ...updated,
      goalTags: updated.goalTags ?? [],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    } as WorkoutPlanRecord;
  }

  async deletePlan(userId: number, planId: number) {
    const result = await db
      .delete(workoutPlans)
      .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
      .returning({ id: workoutPlans.id });

    return result.length > 0;
  }

  async copyPlan(userId: number, planId: number) {
    const source = await this.getPlanDetail(userId, planId);
    if (!source) return null;

    return this.createPlan(
      userId,
      {
        name: `${source.name}（副本）`,
        description: source.description ?? undefined,
        goalTags: source.goalTags,
      },
      source.items.map((item) => ({
        exerciseId: item.exerciseId,
        targetSets: item.targetSets,
        targetReps: item.targetReps,
        targetWeight: item.targetWeight,
        restSeconds: item.restSeconds,
        targetDurationMinutes: item.targetDurationMinutes,
        targetDistance: item.targetDistance,
        targetCalories: item.targetCalories,
      })),
    );
  }

  async setPlanItems(userId: number, planId: number, items: PlanItemInput[]) {
    const existing = await db.query.workoutPlans.findFirst({
      where: and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)),
    });

    if (!existing) return null;

    await db.delete(workoutPlanItems).where(eq(workoutPlanItems.planId, planId));
    await this.insertPlanItems(planId, userId, items);
    await db
      .update(workoutPlans)
      .set({ updatedAt: new Date() })
      .where(eq(workoutPlans.id, planId));

    return this.getPlanDetail(userId, planId);
  }

  async copyFromTemplate(userId: number, templateId: string) {
    const template = PLAN_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return null;

    return this.createPlan(
      userId,
      {
        name: template.name,
        description: template.description,
        goalTags: template.goalTags,
      },
      template.items,
    );
  }

  async copyTemplateGroup(userId: number, groupId: string) {
    const templates =
      groupId === 'push-pull-legs'
        ? PLAN_TEMPLATES.filter((item) => item.id.startsWith('push-pull-legs-'))
        : groupId === 'upper-lower'
          ? PLAN_TEMPLATES.filter((item) => item.id.startsWith('upper-lower-'))
          : PLAN_TEMPLATES.filter((item) => item.id === 'cardio-strength-mix');

    const created = [];
    for (const template of templates) {
      const plan = await this.copyFromTemplate(userId, template.id);
      if (plan) created.push(plan);
    }
    return created;
  }
}

export const fitnessPlanDbService = new FitnessPlanDbService();
