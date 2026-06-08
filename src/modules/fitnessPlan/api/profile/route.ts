import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '../../db/fitnessPlanDbService';
import type { FitnessProfileFormData } from '../../types';
import { parseProfileNumbers } from '../../types';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const profile = await fitnessPlanDbService.getOrCreateProfile(user.id);

    return NextResponse.json({
      success: true,
      data: parseProfileNumbers(profile),
    });
  } catch (error) {
    console.error('[fitnessPlan/profile GET]', error);
    return NextResponse.json({ error: '获取档案失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = (await request.json()) as FitnessProfileFormData;

    if (
      body.dailyCalorieGoal != null &&
      (body.dailyCalorieGoal < 500 || body.dailyCalorieGoal > 10000)
    ) {
      return NextResponse.json({ error: '每日热量目标需在 500–10000 之间' }, { status: 400 });
    }

    if (
      body.currentWeight != null &&
      (body.currentWeight < 20 || body.currentWeight > 500)
    ) {
      return NextResponse.json({ error: '体重数值不合理' }, { status: 400 });
    }

    const profile = await fitnessPlanDbService.updateProfile(user.id, body);

    return NextResponse.json({
      success: true,
      data: parseProfileNumbers(profile),
    });
  } catch (error) {
    console.error('[fitnessPlan/profile PUT]', error);
    return NextResponse.json({ error: '更新档案失败' }, { status: 500 });
  }
}
