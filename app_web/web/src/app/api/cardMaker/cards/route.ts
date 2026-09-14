import {
  createCreateCardHandler,
  createListCardsHandler,
} from 'sa2kit/business/cardMaker/routes';
import { createCardMakerHostRouteConfig } from '@/lib/cardMaker/hostRouteConfig';

const config = createCardMakerHostRouteConfig();

export const dynamic = 'force-dynamic';

export const GET = createListCardsHandler(config);
export const POST = createCreateCardHandler(config);
