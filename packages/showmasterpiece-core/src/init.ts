/**
 * @deprecated 请改用 `@/modules/showmasterpiece/fileUrl`
 */
export {
  createShowmasterpieceFileUrlResolver,
  getShowmasterpieceFileUrlResolver,
  resolveShowmasterpieceFileUrl,
  getShowMasterpieceFileConfig,
} from './fileUrl';

export type { FileUrlResolver } from 'sa2kit/common/file/server';
