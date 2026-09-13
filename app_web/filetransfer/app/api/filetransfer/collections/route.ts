import {
  createListCollectionsHandler,
  createCreateCollectionHandler,
} from 'sa2kit/business/filetransfer/routes';
import { createFileTransferHostRouteConfig } from '../../../../lib/hostRouteConfig';

const config = createFileTransferHostRouteConfig();
export const GET = createListCollectionsHandler(config);
export const POST = createCreateCollectionHandler(config);
