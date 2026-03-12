import { NextRequest, NextResponse } from 'next/server';
import { configDbService } from '@/modules/configManager/db/configDbService';
import {
  buildPersistedConfig,
  DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
  HUARONGDAO_CONFIG_KEY,
} from '@/modules/testField/huarongdao/shared';

export async function GET() {
  try {
    const item = await configDbService.getConfigItemByKey(HUARONGDAO_CONFIG_KEY);
    if (!item?.value) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
      });
    }

    let parsed: unknown = {};
    try {
      parsed = JSON.parse(item.value);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      success: true,
      data: buildPersistedConfig(parsed),
    });
  } catch (error) {
    console.error('[huarongdao/config][GET] failed:', error);
    return NextResponse.json(
      { success: false, error: '获取华容道配置失败' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const normalized = buildPersistedConfig(body);

    const existing = await configDbService.getConfigItemByKey(HUARONGDAO_CONFIG_KEY);
    const value = JSON.stringify(normalized, null, 2);

    if (existing) {
      await configDbService.updateConfigItemByKey(HUARONGDAO_CONFIG_KEY, { value });
    } else {
      await configDbService.createConfigItem({
        categoryId: null,
        key: HUARONGDAO_CONFIG_KEY,
        displayName: '华容道关卡配置',
        description: '华容道主题与三关关卡配置（行列、打乱步数、图片）',
        value,
        defaultValue: JSON.stringify(DEFAULT_HUARONGDAO_PERSISTED_CONFIG, null, 2),
        type: 'json',
        isRequired: false,
        isSensitive: false,
        validation: null,
        sortOrder: 0,
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error('[huarongdao/config][PUT] failed:', error);
    return NextResponse.json(
      { success: false, error: '保存华容道配置失败' },
      { status: 500 },
    );
  }
}
