import {
  createDeleteCardHandler,
  createGetCardHandler,
  createUpdateCardHandler,
} from 'sa2kit/business/cardMaker/routes';
import { createCardMakerHostRouteConfig } from '@/lib/cardMaker/hostRouteConfig';

const config = createCardMakerHostRouteConfig();

export const GET = createGetCardHandler(config);
export const PUT = createUpdateCardHandler(config);
export const DELETE = createDeleteCardHandler(config);
