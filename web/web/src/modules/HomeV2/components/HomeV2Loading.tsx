'use client';

import { Loading } from 'sa2kit/common/ui';

export function HomeV2Loading() {
  return (
    <div className="home-page home-page--loading">
      <Loading active />
    </div>
  );
}
