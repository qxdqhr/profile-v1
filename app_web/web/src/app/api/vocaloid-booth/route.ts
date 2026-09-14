import {
  createVocaloidBoothGetHandler,
  createVocaloidBoothPostHandler,
} from 'sa2kit/business/vocaloidBooth/routes';
import { createVocaloidBoothHostRouteConfig } from '@/lib/vocaloidBooth/hostRouteConfig';

const config = createVocaloidBoothHostRouteConfig();

export const dynamic = 'force-dynamic';

export const GET = createVocaloidBoothGetHandler();
export const POST = createVocaloidBoothPostHandler(config);
