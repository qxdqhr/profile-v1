import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TeachHubApiClient, TeachWorkspaceSummary } from '@profile/teach-hub-shared';

type Props = {
  api: TeachHubApiClient;
};

export function HomePage({ api }: Props) {
  const [items, setItems] = useState<TeachWorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const workspaces = await api.fetchWorkspaces({ status: 'active' });
      setItems(workspaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p>加载工作区…</p>;
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <button className="btn" type="button" onClick={() => void load()}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>我的工作区</h2>
      {items.length === 0 ? (
        <p className="muted">暂无工作区。请先在 Web 端创建。</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="card">
            <h3>{item.title}</h3>
            <p className="muted">
              {item.lessonCount} 课时 · {item.topic ?? '未设主题'}
            </p>
            <a
              href={`${import.meta.env.VITE_TEACH_HUB_API_BASE_URL || 'http://localhost:3002'}/w/${item.id}`}
              target="_blank"
              rel="noreferrer"
            >
              在浏览器中打开 Web 工作区 →
            </a>
          </div>
        ))
      )}
      <p className="muted" style={{ marginTop: 24 }}>
        桌面端 V1 脚手架：工作区列表 + 登录。完整 UI 将复用 teach-hub-shared 逐步补齐。
      </p>
      <p>
        <Link to="/login">重新登录</Link>
      </p>
    </div>
  );
}
