import { createExportDocumentHandler } from 'sa2kit/business/nodeNotes/routes';
import { createNodeNotesHostRouteConfig } from '../../../../../../lib/hostRouteConfig';

const config = createNodeNotesHostRouteConfig();

export const GET = createExportDocumentHandler(config);
