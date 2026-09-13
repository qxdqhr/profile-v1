import { createDeleteTransferHandler } from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
export const DELETE = createDeleteTransferHandler(config);
