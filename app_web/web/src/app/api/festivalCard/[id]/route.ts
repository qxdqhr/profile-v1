import type { NextRequest } from 'next/server';
import {
  createDeleteFestivalCardHandler,
  createGetFestivalCardHandler,
  createUpsertFestivalCardHandler,
} from 'sa2kit/business/festivalCard/routes';
import { requireAdminSession } from '@/lib/auth/api-guard';
import { db } from '@/db';

const config = { db };

const getHandler = createGetFestivalCardHandler(config);
const putHandler = createUpsertFestivalCardHandler(config);
const deleteHandler = createDeleteFestivalCardHandler(config);

type IdRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: IdRouteContext) {
  return getHandler(request, context);
}

export async function PUT(request: NextRequest, context: IdRouteContext) {
  const gated = await requireAdminSession(request);
  if (gated.error) return gated.error;
  return putHandler(request, context);
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  const gated = await requireAdminSession(request);
  if (gated.error) return gated.error;
  return deleteHandler(request, context);
}
