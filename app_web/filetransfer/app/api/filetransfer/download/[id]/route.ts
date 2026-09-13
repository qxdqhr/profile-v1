import { createDownloadTransferHandler } from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
export const GET = createDownloadTransferHandler(config);
