'use client';

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background antialiased">
      <div className="relative h-12 w-12">
        <div
          className="absolute inset-0 rounded-full border-2 border-muted"
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground/80"
          aria-hidden
        />
      </div>
      <p className="text-sm text-muted-foreground tabular-nums tracking-wide">
        加载中…
      </p>
    </div>
  );
}
