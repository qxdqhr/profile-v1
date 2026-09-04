'use client';

/**
 * 宿主薄壳：注入 AuthProvider。配置页 UI 在 sa2kit。
 */
import React from 'react';
import { AuthProvider } from '@profile/auth/react';
import { ShowMasterPiecesConfigPage as ConfigApp } from 'sa2kit/business/showmasterpiece/ui/web';

export default function ShowMasterPiecesConfigPage() {
  return (
    <AuthProvider>
      <ConfigApp />
    </AuthProvider>
  );
}
