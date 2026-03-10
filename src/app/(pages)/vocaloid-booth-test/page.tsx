'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VocaloidBoothTestRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vocaloid-booth');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      正在跳转到 /vocaloid-booth ...
    </main>
  );
}
