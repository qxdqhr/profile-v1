/**
 * 配置管理页面路由
 * 
 * 路径: /configManager
 * 功能: 系统配置管理，需要登录认证
 */

import { ConfigManagerPageWithAuth } from '@/modules/configManager';

export default function ConfigManagerRoute() {
  return <ConfigManagerPageWithAuth />;
} 