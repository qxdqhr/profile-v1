import {
  createUpdateNodeHandler,
  createDeleteNodeHandler,
} from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const PUT = createUpdateNodeHandler(config);
export const DELETE = createDeleteNodeHandler(config);
