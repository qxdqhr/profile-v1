/** @deprecated 请改引 `sa2kit/business/teachHub/server` */
export {
  rewriteTeachHtmlLinks as rewriteTeachHtmlLinksWithBase,
  shouldRewriteHtml,
  contentTypeForPath,
} from 'sa2kit/business/teachHub/server';
import { rewriteTeachHtmlLinks as rewriteWithBase } from 'sa2kit/business/teachHub/server';
import { teachHubPublicBase } from './routes';

/** 兼容旧签名：自动取 teachHubPublicBase() */
export function rewriteTeachHtmlLinks(html: string, workspaceId: string): string {
  return rewriteWithBase(html, workspaceId, teachHubPublicBase());
}
