'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  thLessonProgress,
  thLessonProgressLabel,
  thLessonProgressPercent,
  thLessonProgressRow,
  thLessonProgressSlider,
  thLessonViewerFrame,
  thLessonViewerWrap,
} from '../styles/tw';

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

function getIframeDocument(iframe: HTMLIFrameElement | null): Document | null {
  try {
    return iframe?.contentDocument ?? null;
  } catch {
    return null;
  }
}

function readScrollProgress(doc: Document): number {
  const root = doc.documentElement;
  const body = doc.body;
  const scrollTop = root.scrollTop || body.scrollTop || 0;
  const scrollHeight = Math.max(root.scrollHeight, body.scrollHeight, 1);
  const clientHeight = root.clientHeight || body.clientHeight || 1;
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  if (maxScroll <= 0) return 100;
  return Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
}

function setScrollProgress(doc: Document, percent: number): void {
  const root = doc.documentElement;
  const body = doc.body;
  const scrollHeight = Math.max(root.scrollHeight, body.scrollHeight, 1);
  const clientHeight = root.clientHeight || body.clientHeight || 1;
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  const top = (percent / 100) * maxScroll;
  root.scrollTop = top;
  body.scrollTop = top;
}

export function LessonViewer({ src, title }: LessonViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [percent, setPercent] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    setHtml(null);
    setError('');
    setPercent(0);

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

  const syncProgressFromScroll = useCallback(() => {
    if (draggingRef.current) return;
    const doc = getIframeDocument(iframeRef.current);
    if (!doc) return;
    setPercent(readScrollProgress(doc));
  }, []);

  const bindScrollTracking = useCallback(() => {
    const doc = getIframeDocument(iframeRef.current);
    if (!doc) return undefined;

    const onScroll = () => syncProgressFromScroll();
    doc.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(onScroll)
      : null;
    if (doc.body && observer) observer.observe(doc.body);

    onScroll();
    const retry = window.setTimeout(onScroll, 400);

    return () => {
      doc.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
      window.clearTimeout(retry);
    };
  }, [syncProgressFromScroll]);

  useEffect(() => {
    if (!html) return undefined;
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let cleanup: (() => void) | undefined;

    const attach = () => {
      cleanup?.();
      cleanup = bindScrollTracking();
    };

    iframe.addEventListener('load', attach);
    if (iframe.contentDocument?.readyState === 'complete') {
      attach();
    }

    return () => {
      iframe.removeEventListener('load', attach);
      cleanup?.();
    };
  }, [html, bindScrollTracking]);

  const handleSliderChange = (value: number) => {
    draggingRef.current = true;
    setPercent(value);
    const doc = getIframeDocument(iframeRef.current);
    if (doc) setScrollProgress(doc, value);
  };

  const endDragging = () => {
    draggingRef.current = false;
    syncProgressFromScroll();
  };

  if (error) {
    return <p className="p-4 text-sm text-red-600">{error}</p>;
  }

  if (!html) {
    return <p className="p-4 text-sm text-[#7a6f5c]">加载课时内容…</p>;
  }

  return (
    <div className={thLessonViewerWrap}>
      <div className={thLessonProgress} aria-label="阅读进度">
        <div className={thLessonProgressRow}>
          <span className={thLessonProgressLabel}>阅读进度</span>
          <span className={thLessonProgressPercent}>{percent.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={percent}
          className={thLessonProgressSlider}
          aria-label="拖动调整阅读位置"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-valuetext={`已阅读 ${percent.toFixed(1)}%`}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          onPointerUp={endDragging}
          onPointerCancel={endDragging}
          onKeyUp={endDragging}
        />
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title={title}
        className={thLessonViewerFrame}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
