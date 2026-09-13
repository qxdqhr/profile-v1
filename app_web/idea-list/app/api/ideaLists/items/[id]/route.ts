import {
  createUpdateIdeaItemHandler,
  createDeleteIdeaItemHandler,
} from 'sa2kit/business/ideaList/routes';
import { createIdeaListHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createIdeaListHostRouteConfig();

export const PUT = createUpdateIdeaItemHandler(config);
export const DELETE = createDeleteIdeaItemHandler(config);
