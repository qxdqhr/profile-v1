import { createListAssetsHandler } from 'sa2kit/business/cardMaker/routes';
import { createCardMakerHostRouteConfig } from '@/lib/cardMaker/hostRouteConfig';

const config = createCardMakerHostRouteConfig();

export const dynamic = 'force-dynamic';

export const GET = createListAssetsHandler(config);
