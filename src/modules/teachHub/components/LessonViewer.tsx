'use client';

import { useEffect, useState } from 'react';

type LessonViewerProps = {
  src: string;
  title: string;
};

async function loadLessonHtml(src: string): Promise<string> {
  const response = await fetch(src, { credentials: 'include', cache: 'no-store' });
  const body = await response.text();
  if (!response.ok) {
    let message = `加载失败 (${response.status})`;
    try {
      const data = JSON.parse(body) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // 非 JSON 错误体，沿用默认文案
    }
    throw new Error(message);
  }
  return body;
}

export function LessonViewer({ src, title }: LessonViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setHtml(null);
    setError('');

    void loadLessonHtml(src)
      .then((content) => {
        if (mounted) setHtml(content);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : '加载课时失败');
        }
      });

    return () => {
      mounted = false;
    };
  }, [src]);

  if (error) {
    return <p className="p-4 text-sm text-red-600">{error}</p>;
  }

  if (!html) {
    return <p className="p-4 text-sm text-[#7a6f5c]">加载课时内容…</p>;
  }

  return (
    <iframe
      srcDoc={html}
      title={title}
      className="min-h-0 w-full flex-1 border-none bg-[#faf9f7]"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
