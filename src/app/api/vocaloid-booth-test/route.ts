import { NextRequest, NextResponse } from 'next/server';
import { vocaloidBoothTestRuntime } from '@/lib/vocaloidBoothTestRuntime';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'vocaloid booth test route ready',
    auditEvents: vocaloidBoothTestRuntime.auditSink.list().slice(-10),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'create') {
      const created = await vocaloidBoothTestRuntime.service.createUpload({
        boothId: body.boothId ?? 'test-booth',
        ttlHours: body.ttlHours ?? 24,
        metadata: {
          nickname: body.nickname,
          contactTail: body.contactTail,
          note: body.note,
        },
        files: (body.files ?? [
          {
            fileName: 'demo-project.zip',
            objectKey: 'test/demo-project.zip',
            size: 1024,
            kind: 'project',
          },
        ]).map((file: any) => ({
          fileName: file.fileName,
          objectKey: file.objectKey,
          size: Number(file.size ?? 0),
          mimeType: file.mimeType,
          checksum: file.checksum,
          kind: file.kind ?? 'other',
        })),
      });

      return NextResponse.json({ success: true, data: created });
    }

    if (action === 'redeem') {
      const result = await vocaloidBoothTestRuntime.service.resolveDownloadFilesByCode(body.matchCode, {
        requesterKey: body.requesterKey ?? 'test-user',
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        data: {
          auditEvents: vocaloidBoothTestRuntime.auditSink.list().slice(-20),
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
