import type { NextRequest } from 'next/server';
import {
  createDeleteFestivalCardHandler,
  createGetFestivalCardHandler,
  createUpsertFestivalCardHandler,
} from 'sa2kit/business/festivalCard/routes';
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
  return putHandler(request, context);
}

export async function DELETE(request: NextRequest, context: IdRouteContext) {
  return deleteHandler(request, context);
}
