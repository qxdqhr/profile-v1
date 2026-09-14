import {
  createGetModelHandler,
  createUpdateModelHandler,
  createDeleteModelHandler,
} from 'sa2kit/business/mmd/routes';
import { createMmdResourceHostRouteConfig } from '@/lib/mmd/hostRouteConfig';

const config = createMmdResourceHostRouteConfig();

export const dynamic = 'force-dynamic';

export const GET = createGetModelHandler(config);
export const PUT = createUpdateModelHandler(config);
export const DELETE = createDeleteModelHandler(config);
