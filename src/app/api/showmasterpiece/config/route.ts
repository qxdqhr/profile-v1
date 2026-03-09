/**
 * ShowMasterpiece 配置管理 API 路由
 *
 * 这个文件定义了画集系统配置管理的API端点。
 * 提供配置的获取、更新和重置功能。
 *
 * API端点：
 * - GET /api/showmasterpiece/config - 获取系统配置
 * - PUT /api/showmasterpiece/config - 更新系统配置（需要认证）
 * - DELETE /api/showmasterpiece/config - 重置系统配置（需要认证）
 *
 * 权限控制：
 * - GET 请求：公开访问，任何用户都可以获取配置
 * - PUT/DELETE 请求：需要用户认证，只有登录用户才能修改配置
 *
 * @fileoverview API路由 - 系统配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { validateApiAuth } from '@/lib/auth/legacy';
import { asc, eq } from 'drizzle-orm';
import { comicUniverseCategories, comicUniverseConfigs } from 'sa2kit/showmasterpiece/server';

type HomeTabItem = {
  name: string;
  description: string | null;
  category: string;
  visible: boolean;
  order: number;
};

type HomeTabItemInput = {
  name?: string;
  description?: string | null;
  category?: string;
  visible?: boolean;
  order?: number;
};

type MiniappFloatingButtonsInput = {
  showCart?: boolean;
  showHistory?: boolean;
};

type MasterpiecesConfigRow = typeof comicUniverseConfigs.$inferSelect;

const buildHomeTabsFromCategories = (
  categories: { name: string; description: string | null; displayOrder: number | null; isActive: boolean }[],
): HomeTabItem[] =>
  categories.map((item, index) => ({
    name: item.name,
    description: item.description ?? null,
    category: item.name,
    visible: item.isActive,
    order: index,
  }));

const toConfigResponse = (
  config: MasterpiecesConfigRow,
  categories: { name: string; description: string | null; displayOrder: number | null; isActive: boolean }[],
) => ({
  ...config,
  homeTabConfig: buildHomeTabsFromCategories(categories),
});

const loadCategories = async () =>
  db
    .select({
      name: comicUniverseCategories.name,
      description: comicUniverseCategories.description,
      displayOrder: comicUniverseCategories.displayOrder,
      isActive: comicUniverseCategories.isActive,
    })
    .from(comicUniverseCategories)
    .orderBy(asc(comicUniverseCategories.displayOrder), asc(comicUniverseCategories.name));

const buildDefaultConfig = (
  categories: { name: string; description: string | null; displayOrder: number | null; isActive: boolean }[],
) => ({
  siteName: '画集展览',
  siteDescription: '精美的艺术作品展览',
  heroTitle: '艺术画集展览',
  heroSubtitle: '探索精美的艺术作品，感受创作的魅力',
  maxCollectionsPerPage: 9,
  enableSearch: true,
  enableCategories: true,
  homeTabConfig: buildHomeTabsFromCategories(categories),
  miniappFloatingButtons: {
    showCart: true,
    showHistory: true,
  },
  defaultCategory: 'all',
  theme: 'light',
  language: 'zh',
  updatedAt: new Date(),
});

/**
 * GET /api/showmasterpiece/config - 获取系统配置
 */
export async function GET() {
  try {
    const categories = await loadCategories();
    const existing = await db.select().from(comicUniverseConfigs).limit(1);

    if (existing.length === 0) {
      const created = await db
        .insert(comicUniverseConfigs)
        .values(buildDefaultConfig(categories))
        .returning();
      const config = toConfigResponse(created[0], categories);
      console.log('获取配置成功:', config);
      return NextResponse.json(config);
    }

    const config = toConfigResponse(existing[0], categories);
    console.log('获取配置成功:', config);
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
  }
}

/**
 * PUT /api/showmasterpiece/config - 更新系统配置
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const configData = await request.json();
    const categories = await loadCategories();
    const existing = await db.select().from(comicUniverseConfigs).limit(1);

    const updateData: Partial<MasterpiecesConfigRow> = {
      updatedAt: new Date(),
    };

    if (configData.siteName !== undefined) updateData.siteName = configData.siteName;
    if (configData.siteDescription !== undefined) updateData.siteDescription = configData.siteDescription;
    if (configData.heroTitle !== undefined) updateData.heroTitle = configData.heroTitle;
    if (configData.heroSubtitle !== undefined) updateData.heroSubtitle = configData.heroSubtitle;
    if (configData.maxCollectionsPerPage !== undefined) updateData.maxCollectionsPerPage = configData.maxCollectionsPerPage;
    if (configData.enableSearch !== undefined) updateData.enableSearch = configData.enableSearch;
    if (configData.enableCategories !== undefined) updateData.enableCategories = configData.enableCategories;
    if (configData.miniappFloatingButtons !== undefined) {
      const input = configData.miniappFloatingButtons as MiniappFloatingButtonsInput;
      updateData.miniappFloatingButtons = {
        showCart: input?.showCart ?? true,
        showHistory: input?.showHistory ?? true,
      } as any;
    }
    if (configData.defaultCategory !== undefined) updateData.defaultCategory = configData.defaultCategory;
    if (configData.theme !== undefined) updateData.theme = configData.theme;
    if (configData.language !== undefined) updateData.language = configData.language;

    if (Array.isArray(configData.homeTabConfig)) {
      const items = configData.homeTabConfig
        .filter((item: HomeTabItemInput) => {
          if (!item) return false;
          const rawName = typeof item.name === 'string' ? item.name : item.category;
          return typeof rawName === 'string' && rawName.trim().length > 0;
        })
        .map((item: HomeTabItemInput) => {
          const rawName = typeof item.name === 'string' ? item.name : item.category;
          const name = rawName ? rawName.trim() : '';
          const description = typeof item.description === 'string' ? item.description.trim() : '';
          return {
            name,
            category: name,
            description: description.length > 0 ? description : null,
            visible: item.visible ?? true,
            order: Number.isFinite(item.order) ? Number(item.order) : 0,
          };
        })
        .sort((a: HomeTabItem, b: HomeTabItem) => a.order - b.order)
        .map((item: HomeTabItem, index: number) => ({ ...item, order: index }));

      const current = await loadCategories();
      const currentMap = new Map(current.map((cat) => [cat.name, cat]));

      const missingDescription = items.find((item) => {
        if (item.description && item.description.trim().length > 0) return false;
        return !currentMap.has(item.name);
      });

      if (missingDescription) {
        return NextResponse.json({ error: '新增分类时，分类名称和展示文案均不能为空' }, { status: 400 });
      }

      const incomingSet = new Set(items.map((item: HomeTabItem) => item.name));

      await Promise.all(
        items.map(async (item: HomeTabItem) => {
          const existingCategory = currentMap.get(item.name);
          const description = item.description ?? existingCategory?.description ?? null;

          if (existingCategory) {
            await db
              .update(comicUniverseCategories)
              .set({
                isActive: item.visible,
                displayOrder: item.order,
                description,
                updatedAt: new Date(),
              })
              .where(eq(comicUniverseCategories.name, item.name));
          } else {
            await db.insert(comicUniverseCategories).values({
              name: item.name,
              description,
              isActive: item.visible,
              displayOrder: item.order,
            });
          }
        }),
      );

      const toDisable = current.filter((cat) => !incomingSet.has(cat.name));
      if (toDisable.length > 0) {
        await Promise.all(
          toDisable.map((cat) =>
            db
              .update(comicUniverseCategories)
              .set({ isActive: false, updatedAt: new Date() })
              .where(eq(comicUniverseCategories.name, cat.name)),
          ),
        );
      }

      updateData.homeTabConfig = items;
    } else if (existing.length > 0) {
      updateData.homeTabConfig = existing[0].homeTabConfig;
    }

    if (existing.length === 0) {
      const created = await db
        .insert(comicUniverseConfigs)
        .values({ ...buildDefaultConfig(categories), ...updateData })
        .returning();
      return NextResponse.json(toConfigResponse(created[0], await loadCategories()));
    }

    const updated = await db
      .update(comicUniverseConfigs)
      .set(updateData)
      .where(eq(comicUniverseConfigs.id, existing[0].id))
      .returning();

    return NextResponse.json(toConfigResponse(updated[0], await loadCategories()));
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json({ error: '更新配置失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/showmasterpiece/config - 重置系统配置
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const categories = await loadCategories();
    await db.delete(comicUniverseConfigs);
    const created = await db
      .insert(comicUniverseConfigs)
      .values(buildDefaultConfig(categories))
      .returning();
    return NextResponse.json(toConfigResponse(created[0], categories));
  } catch (error) {
    console.error('重置配置失败:', error);
    return NextResponse.json({ error: '重置配置失败' }, { status: 500 });
  }
}
