import { notFoundJson, requireApiSession } from '@/lib/auth/api-guard';
import { isNodeProduction } from '@/lib/runtime/is-node-production';

export function examplesBlockedInProduction() {
  if (isNodeProduction()) {
    return notFoundJson();
  }
  return null;
}

/** 生产 404；开发需登录（禁止 x-user-id 伪造） */
export async function requireExampleAccess(request: Request) {
  const blocked = examplesBlockedInProduction();
  if (blocked) return { error: blocked };
  return requireApiSession(request);
}
