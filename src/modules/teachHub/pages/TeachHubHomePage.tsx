'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Title } from 'animal-island-ui';
import { NewWorkspaceModal } from '../components/NewWorkspaceModal';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { fetchWorkspaces } from '../services/teachHubClient';
import { useTeachHubStore } from '../store/teachHubStore';
import { TEACH_HUB_BASE } from '../utils/routes';

export function TeachHubHomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const workspaces = useTeachHubStore((s) => s.workspaces);
  const listError = useTeachHubStore((s) => s.listError);
  const setWorkspaces = useTeachHubStore((s) => s.setWorkspaces);

  const refreshWorkspaces = async () => {
    const items = await fetchWorkspaces({ status: 'active' });
    setWorkspaces(items);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Title size="middle" color="app-teal">
          我的学习工作区
        </Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          + 新建工作区
        </Button>
      </div>

      {listError ? (
        <p className="mb-4 text-sm text-red-600">{listError}</p>
      ) : null}

      {workspaces.length === 0 ? (
        <div className="th-empty">
          <p>还没有学习工作区。</p>
          <p className="mt-2 text-sm">创建一个主题（如「音乐乐理」），或导入已有的 teach 工作区 zip。</p>
          <Button type="primary" className="mt-4" onClick={() => setModalOpen(true)}>
            开始创建
          </Button>
        </div>
      ) : (
        <div className="th-grid">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-[#7a6f5c]">
        <Link href="/testField" className="text-[#2c5282] hover:underline">
          ← 返回实验田
        </Link>
      </p>

      <NewWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => void refreshWorkspaces()}
      />
    </div>
  );
}
