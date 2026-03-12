// @ts-nocheck
'use client';

import React from 'react';
import * as sa2kit from 'sa2kit';

export default function HuarongdaoConfigPage() {
  const ConfigPage = (sa2kit as any)?.huarongdao?.webUI?.HuarongdaoConfigPage;
  if (!ConfigPage) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        当前安装的 sa2kit 版本未导出华容道配置页组件（huarongdao.webUI.HuarongdaoConfigPage）。
      </div>
    );
  }
  return <ConfigPage />;
}
