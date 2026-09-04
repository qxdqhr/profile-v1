import { createCreateEdgeHandler } from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const POST = createCreateEdgeHandler(config);
