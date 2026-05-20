'use client';

export function HomeAmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />
      <div className="absolute -top-[35%] left-1/2 h-[70vh] w-[min(140vw,900px)] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-100/70 via-indigo-50/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-[10%] -right-[15%] h-[45vh] w-[min(70vw,520px)] rounded-full bg-gradient-to-tl from-amber-50/60 via-rose-50/20 to-transparent blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.9),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
