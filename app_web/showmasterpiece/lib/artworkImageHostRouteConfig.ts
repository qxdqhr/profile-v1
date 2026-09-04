import { db } from '@profile/db';
import type { ArtworkImageRouteConfig } from 'sa2kit/business/showmasterpiece/routes';
import { getShowmasterpieceFileUrlResolver } from './fileUrl';

export function createArtworkImageHostRouteConfig(): ArtworkImageRouteConfig {
  return {
    db,
    resolveFileUrl: (fileId) => getShowmasterpieceFileUrlResolver()(fileId),
  };
}
