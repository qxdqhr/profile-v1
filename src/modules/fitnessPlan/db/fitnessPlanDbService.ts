import { db } from '@/db';
import { and, eq } from 'drizzle-orm';
import {
  dailyCheckins,
  fitnessProfiles,
} from './schema';
import type {
  CheckinTodayState,
  CheckinType,
  FitnessGoal,
  FitnessProfileFormData,
} from '../types';
import { formatDateKey } from '../types';

class FitnessPlanDbService {
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

    if (data.goal) {
      patch.goal = data.goal as FitnessGoal;
    }
    if (data.weightUnit) {
      patch.weightUnit = data.weightUnit;
    }
    if (data.dailyCalorieGoal != null) {
      patch.dailyCalorieGoal = data.dailyCalorieGoal;
    }
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
        and(
          eq(dailyCheckins.userId, userId),
          eq(dailyCheckins.checkinDate, dateKey),
        ),
      );

    const state: CheckinTodayState = {
      daily: false,
      workout: false,
      diet: false,
      weight: false,
    };

    for (const row of rows) {
      const type = row.type as CheckinType;
      if (type in state) {
        state[type] = true;
      }
    }

    return state;
  }
}

export const fitnessPlanDbService = new FitnessPlanDbService();
