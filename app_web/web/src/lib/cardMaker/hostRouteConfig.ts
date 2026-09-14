import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { getApiSessionUser } from '@/lib/auth/session';
import type { CardMakerRouteConfig } from 'sa2kit/business/cardMaker/routes';

export function createCardMakerHostRouteConfig(): CardMakerRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    uploadAssetFile: async ({ file, type }) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'uploads', 'cardMaker', type);
      const filePath = join(uploadDir, fileName);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);

      return { fileUrl: `/uploads/cardMaker/${type}/${fileName}` };
    },
  };
}
