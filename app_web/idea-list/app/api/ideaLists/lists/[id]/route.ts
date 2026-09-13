import {
  createUpdateIdeaListHandler,
  createDeleteIdeaListHandler,
} from 'sa2kit/business/ideaList/routes';
import { createIdeaListHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createIdeaListHostRouteConfig();

export const PUT = createUpdateIdeaListHandler(config);
export const DELETE = createDeleteIdeaListHandler(config);
