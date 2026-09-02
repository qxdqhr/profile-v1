import { NextRequest, NextResponse } from 'next/server';
import { CardMakerDbService } from '@/modules/cardMaker/db/cardMakerDbService';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getApiSessionUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const name = formData.get('name') as string;

    if (!file || !type || !category || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 },
      );
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'uploads', 'cardMaker', type);
    const filePath = join(uploadDir, fileName);

    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/cardMaker/${type}/${fileName}`;

    const asset = await CardMakerDbService.createAsset({
      type,
      category,
      fileUrl,
      name,
      tags: JSON.stringify([]),
    });

    const formattedAsset = {
      ...asset,
      tags: [],
    };

    return NextResponse.json(formattedAsset, { status: 201 });
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 },
    );
  }
}
