/**
 * 小游戏大厅使用 sa2kit/common/ui/patterns，须在本路由段加载 UI 门面样式。
 * 登录鉴权样式由 @profile/auth AuthProvider 引导（见 sa2kit-ui-bootstrap）。
 */
import 'sa2kit/common/ui/style';
import type { ReactNode } from 'react';

export default function GamesLayout({ children }: { children: ReactNode }) {
  return children;
}
