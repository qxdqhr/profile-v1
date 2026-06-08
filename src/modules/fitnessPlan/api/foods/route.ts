import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { FoodItemFormData } from '@/modules/fitnessPlan/types';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const search = request.nextUrl.searchParams.get('search') ?? undefined;
    const data = await fitnessPlanDbService.listFoodItems(user.id, { search });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/foods GET]', error);
    return NextResponse.json({ error: '获取食物列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as FoodItemFormData;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: '食物名称不能为空' }, { status: 400 });
    }
    if (!Number.isFinite(body.calories) || body.calories < 0) {
      return NextResponse.json({ error: '热量无效' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.createFoodItem(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/foods POST]', error);
    return NextResponse.json({ error: '创建食物失败' }, { status: 500 });
  }
}
