import {
  createListModelsHandler,
  createCreateModelHandler,
} from 'sa2kit/business/mmd/routes';
import { createMmdResourceHostRouteConfig } from '@/lib/mmd/hostRouteConfig';

const config = createMmdResourceHostRouteConfig();

export const dynamic = 'force-dynamic';

export const GET = createListModelsHandler(config);
export const POST = createCreateModelHandler(config);
