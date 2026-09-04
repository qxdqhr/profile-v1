import {
  createGetArtworkImageHandler,
  createHeadArtworkImageHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createArtworkImageHostRouteConfig } from '@lib/artworkImageHostRouteConfig';

const config = createArtworkImageHostRouteConfig();

export const GET = createGetArtworkImageHandler(config);
export const HEAD = createHeadArtworkImageHandler(config);
