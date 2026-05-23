import { NextResponse } from 'next/server';

/** collections GET 缓存策略（PERF1） */
export function applyCollectionsCacheHeaders(
  response: NextResponse,
  options: { overview: boolean; nocache: boolean },
): NextResponse {
  if (options.nocache) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  if (options.overview) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=120, stale-while-revalidate=300',
    );
    return response;
  }

  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  return response;
}
