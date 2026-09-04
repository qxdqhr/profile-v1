import {
  createListDocumentsHandler,
  createCreateDocumentHandler,
} from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const GET = createListDocumentsHandler(config);
export const POST = createCreateDocumentHandler(config);
