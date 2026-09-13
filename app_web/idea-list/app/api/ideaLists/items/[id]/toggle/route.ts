import { createToggleIdeaItemHandler } from 'sa2kit/business/ideaList/routes';
import { createIdeaListHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createIdeaListHostRouteConfig();

export const POST = createToggleIdeaItemHandler(config);
