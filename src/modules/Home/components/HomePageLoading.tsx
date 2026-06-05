'use client';

import { Loading } from 'animal-island-ui';

export function HomePageLoading() {
  return (
    <div className="home-page home-page--loading">
      <Loading active />
    </div>
  );
}
