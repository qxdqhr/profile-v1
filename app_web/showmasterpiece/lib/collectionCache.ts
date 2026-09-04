import { NextResponse } from 'next/server';

/** collections GET 缓存策略（PERF1）；接受 Web Response，返回带头的同对象 */
export function applyCollectionsCacheHeaders(
  response: Response,
  options: { overview: boolean; nocache: boolean },
): Response {
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

/** @deprecated 兼容旧 NextResponse 调用方 */
export function applyCollectionsCacheHeadersNext(
  response: NextResponse,
  options: { overview: boolean; nocache: boolean },
): NextResponse {
  return applyCollectionsCacheHeaders(response, options) as NextResponse;
}
