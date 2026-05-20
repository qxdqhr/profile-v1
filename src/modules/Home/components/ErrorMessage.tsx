'use client';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 antialiased">
      <div
        className="max-w-md rounded-2xl bg-card px-6 py-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)]"
        role="alert"
      >
        <p className="text-sm font-medium text-destructive">无法加载首页</p>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
