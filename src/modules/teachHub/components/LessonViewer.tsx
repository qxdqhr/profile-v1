'use client';

type LessonViewerProps = {
  src: string;
  title: string;
};

export function LessonViewer({ src, title }: LessonViewerProps) {
  return (
    <iframe
      className="th-lesson-frame"
      src={src}
      title={title}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
