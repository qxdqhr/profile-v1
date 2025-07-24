/**
 * ShowMasterpiece 模块 - 批量预订API路由
 * 
 * 处理批量预订相关的HTTP请求
 * 
 * @fileoverview 批量预订API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 批量预订
 * 
 * @param request Next.js请求对象
 * @returns 批量预订结果
 */
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qqNumber, phoneNumber, items, notes } = body;

    // 数据验证
    if (!qqNumber || !phoneNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: '缺少必要参数：QQ号、手机号、预订项列表' },
        { status: 400 }
      );
    }

    // 验证QQ号格式
    const qqRegex = /^\d{5,11}$/;
    if (!qqRegex.test(qqNumber)) {
      return NextResponse.json(
        { message: 'QQ号格式不正确' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    const bookingIds: number[] = [];
    const failures: { collectionId: number; reason: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    // 批量创建预订
    for (const item of items) {
      try {
        // 验证预订项数据
        if (!item.collectionId || !item.quantity) {
          failures.push({
            collectionId: item.collectionId,
            reason: '缺少必要参数'
          });
          failCount++;
          continue;
        }

        if (item.quantity < 1) {
          failures.push({
            collectionId: item.collectionId,
            reason: '预订数量必须大于0'
          });
          failCount++;
          continue;
        }

        // 检查画集是否存在
        const collection = await db
          .select({ id: comicUniverseCollections.id })
          .from(comicUniverseCollections)
          .where(eq(comicUniverseCollections.id, item.collectionId))
          .limit(1);

        if (collection.length === 0) {
          failures.push({
            collectionId: item.collectionId,
            reason: '画集不存在'
          });
          failCount++;
          continue;
        }

        // 检查是否已存在相同的预订（QQ号+手机号+画集ID）
        const existingBooking = await db
          .select({ id: comicUniverseBookings.id })
          .from(comicUniverseBookings)
          .where(
            and(
              eq(comicUniverseBookings.qqNumber, qqNumber),
              eq(comicUniverseBookings.phoneNumber, phoneNumber),
              eq(comicUniverseBookings.collectionId, item.collectionId)
            )
          )
          .limit(1);

        if (existingBooking.length > 0) {
          // 如果已存在，更新数量而不是创建新预订
          const [updatedBooking] = await db
            .update(comicUniverseBookings)
            .set({
              quantity: item.quantity,
              notes: notes || null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(comicUniverseBookings.qqNumber, qqNumber),
                eq(comicUniverseBookings.phoneNumber, phoneNumber),
                eq(comicUniverseBookings.collectionId, item.collectionId)
              )
            )
            .returning();

          bookingIds.push(updatedBooking.id);
          successCount++;
        } else {
          // 如果不存在，创建新预订
          const [newBooking] = await db
            .insert(comicUniverseBookings)
            .values({
              collectionId: item.collectionId,
              qqNumber,
              phoneNumber,
              quantity: item.quantity,
              notes: notes || null,
              status: 'pending',
            })
            .returning();

          bookingIds.push(newBooking.id);
          successCount++;
        }
      } catch (error) {
        console.error(`创建预订失败 (collectionId: ${item.collectionId}):`, error);
        failures.push({
          collectionId: item.collectionId,
          reason: '创建预订失败'
        });
        failCount++;
      }
    }

    return NextResponse.json({
      bookingIds,
      successCount,
      failCount,
      failures: failures.length > 0 ? failures : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('批量预订失败:', error);
    return NextResponse.json(
      { message: '批量预订失败' },
      { status: 500 }
    );
  }
}

export { POST }; 