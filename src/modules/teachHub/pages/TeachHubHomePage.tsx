'use client';

import Link from 'next/link';
import { Button, Title } from 'animal-island-ui';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { useTeachHubStore } from '../store/teachHubStore';
import { TEACH_HUB_BASE } from '../utils/routes';

export function TeachHubHomePage() {
  const workspaces = useTeachHubStore((s) => s.workspaces);
  const listError = useTeachHubStore((s) => s.listError);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Title size="middle" color="app-teal">
          我的学习工作区
        </Title>
        <Link href={`${TEACH_HUB_BASE}/new`}>
          <Button type="primary">+ 新建工作区</Button>
        </Link>
      </div>

      {listError ? (
        <p className="mb-4 text-sm text-red-600">{listError}</p>
      ) : null}

      {workspaces.length === 0 ? (
        <div className="th-empty">
          <p>还没有学习工作区。</p>
          <p className="mt-2 text-sm">创建一个主题（如「音乐乐理」），或导入已有的 teach 工作区 zip。</p>
          <Link href={`${TEACH_HUB_BASE}/new`} className="mt-4 inline-block">
            <Button type="primary">开始创建</Button>
          </Link>
        </div>
      ) : (
        <div className="th-grid">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}
    </div>
  );
}
