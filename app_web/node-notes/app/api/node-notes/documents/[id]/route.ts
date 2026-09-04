import {
  createGetDocumentHandler,
  createUpdateDocumentHandler,
  createDeleteDocumentHandler,
} from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const GET = createGetDocumentHandler(config);
export const PUT = createUpdateDocumentHandler(config);
export const DELETE = createDeleteDocumentHandler(config);
