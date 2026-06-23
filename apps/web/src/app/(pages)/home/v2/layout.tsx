import '@/modules/HomeV2/home-v2-sa2kit.css';
import '@/modules/HomeV2/home-page-v2.css';
import type { ReactNode } from 'react';

export default function HomeV2Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
