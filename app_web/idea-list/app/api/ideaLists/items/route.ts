import {
  createListIdeaItemsHandler,
  createCreateIdeaItemHandler,
} from 'sa2kit/business/ideaList/routes';
import { createIdeaListHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createIdeaListHostRouteConfig();

export const GET = createListIdeaItemsHandler(config);
export const POST = createCreateIdeaItemHandler(config);
