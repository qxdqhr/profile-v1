import { requireAuthUser, ok, fail } from '../_helpers';
import { nodeNotesDbService } from '../../db/nodeNotesDbService';
import type { DocumentFormData } from '../../types';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const documents = await nodeNotesDbService.getUserDocuments(String(user!.id));
  return ok(documents);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const body = (await request.json()) as DocumentFormData;
  if (!body.title?.trim()) return fail('文档标题不能为空', 400);
  if (body.title.trim().length > 100) return fail('文档标题不能超过 100 字', 400);

  const doc = await nodeNotesDbService.createDocument(String(user!.id), body);
  return ok(doc);
}
