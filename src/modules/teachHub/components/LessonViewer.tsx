type LessonViewerProps = {
  src: string;
  title: string;
};

export function LessonViewer({ src, title }: LessonViewerProps) {
  return (
    <iframe
      src={src}
      title={title}
      className="min-h-0 w-full flex-1 border-none bg-[#faf9f7]"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
