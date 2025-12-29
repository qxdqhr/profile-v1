// @ts-nocheck
'use client';

import React from 'react';
import { MmdAdminPanel } from 'sa2kit/mmd/admin';
import { universalFileClient } from 'sa2kit/universalFile';

/**
 * MMD 后台管理页面
 * 路由：/testField/mmdplaylist-test/config
 *
 * 功能：
 * - 可视化配置播放列表与播放节点
 * - 直接上传文件到 OSS（使用 universalFileClient）
 * - 自动完成文件 ID → URL 映射
 *
 * 注意：
 * - 当前使用 demo 用户 ID，可按需替换为登录用户 ID
 * - API 基础路径默认为 /api/mmd，可按需调整
 */
export default function MmdPlaylistConfigPage() {
  // 若有登录体系，可从 session / cookies 获取 userId
  const userId = 'demo-user';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MmdAdminPanel
        fileService={universalFileClient}
        userId={userId}
        apiBaseUrl="/api/mmd"
        showAdvancedOptions
        className="min-h-screen"
      />
    </div>
  );
}
