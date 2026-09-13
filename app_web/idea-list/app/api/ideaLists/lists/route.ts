import {
  createListIdeaListsHandler,
  createCreateIdeaListHandler,
} from 'sa2kit/business/ideaList/routes';
import { createIdeaListHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createIdeaListHostRouteConfig();

export const GET = createListIdeaListsHandler(config);
export const POST = createCreateIdeaListHandler(config);
