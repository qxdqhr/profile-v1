import { createListAssetCategoriesHandler } from 'sa2kit/business/cardMaker/routes';
import { createCardMakerHostRouteConfig } from '@/lib/cardMaker/hostRouteConfig';

const config = createCardMakerHostRouteConfig();

export const GET = createListAssetCategoriesHandler(config);
