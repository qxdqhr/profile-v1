'use client';

/**
 * 宿主薄壳：注入 AuthProvider。UI 在 sa2kit/business/showmasterpiece/ui/web。
 */
import React from 'react';
import { AuthProvider } from '@profile/auth/react';
import {
  ShowMasterPiecesPage as ShowMasterPiecesApp,
  type ShowMasterPiecesPageProps,
} from 'sa2kit/business/showmasterpiece/ui/web';

export type { ShowMasterPiecesPageProps };

export default function ShowMasterPiecesPage(props: ShowMasterPiecesPageProps = {}) {
  return (
    <AuthProvider>
      <ShowMasterPiecesApp {...props} />
    </AuthProvider>
  );
}

export { ShowMasterPiecesPage };
