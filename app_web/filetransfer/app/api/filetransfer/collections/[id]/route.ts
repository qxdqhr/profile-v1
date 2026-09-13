import { createCollectionByIdHandler } from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
const handler = createCollectionByIdHandler(config);
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
