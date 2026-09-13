import {
  createListTransfersHandler,
  createUploadTransferHandler,
} from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
export const GET = createListTransfersHandler(config);
export const POST = createUploadTransferHandler(config);
