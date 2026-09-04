'use client';

/**
 * 宿主薄壳。历史页 UI 在 sa2kit（无需强鉴权壳时仍统一 AuthProvider）。
 */
import React from 'react';
import { AuthProvider } from '@profile/auth/react';
import { ShowMasterPiecesHistoryPage as HistoryApp } from 'sa2kit/business/showmasterpiece/ui/web';

export default function ShowMasterPiecesHistoryPage() {
  return (
    <AuthProvider>
      <HistoryApp />
    </AuthProvider>
  );
}
