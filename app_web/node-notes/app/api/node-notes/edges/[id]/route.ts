import {
  createUpdateEdgeHandler,
  createDeleteEdgeHandler,
} from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const PUT = createUpdateEdgeHandler(config);
export const DELETE = createDeleteEdgeHandler(config);
