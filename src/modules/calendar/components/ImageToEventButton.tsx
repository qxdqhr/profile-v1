'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import {
  analyzeCalendarEventFromImage,
  buildCalendarImageInput,
  type CalendarEventFromImageOutput,
} from '../services/calendarAiService';

interface ImageToEventButtonProps {
  onResult: (draft: CalendarEventFromImageOutput, previewUrl: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageToEventButton({
  onResult,
  onError,
  disabled = false,
  className = '',
}: ImageToEventButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('请选择图片文件');
      return;
    }

    setLoading(true);
    const previewUrl = URL.createObjectURL(file);

    try {
      const { imageBase64, mimeType } = await buildCalendarImageInput(file);
      const draft = await analyzeCalendarEventFromImage({
        imageBase64,
        mimeType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language || 'zh-CN',
        referenceDate: new Date().toISOString(),
      });
      onResult(draft, previewUrl);
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      onError(err instanceof Error ? err.message : '识图失败，请重试');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/80 px-3 text-sm font-medium text-violet-700',
          'transition-transform hover:bg-violet-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
          className,
        ].join(' ')}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {loading ? '识别中…' : '从图片识别'}
      </button>
    </>
  );
}
