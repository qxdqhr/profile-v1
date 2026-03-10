import { NextRequest, NextResponse } from 'next/server';
import { vocaloidBoothTestRuntime } from '@/lib/vocaloidBoothTestRuntime';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'vocaloid booth route ready',
    auditEvents: vocaloidBoothTestRuntime.auditSink.list().slice(-20),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'create') {
      const created = await vocaloidBoothTestRuntime.service.createUpload({
        boothId: body.boothId ?? 'production-booth',
        ttlHours: body.ttlHours ?? 24 * 14,
        metadata: {
          nickname: body.nickname,
          contactTail: body.contactTail,
          note: body.note,
        },
        files: (body.files ?? []).map((file: any) => ({
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
      const record = await vocaloidBoothTestRuntime.service.resolveDownloadFilesByCode(body.matchCode, {
        requesterKey: body.requesterKey ?? 'user',
      });

      if (!record || record.status !== 'active') {
        return NextResponse.json({ success: true, data: record, files: [] });
      }

      const files = await Promise.all(
        record.files.map(async (file) => {
          try {
            const res = await fetch(`${request.nextUrl.origin}/api/universal-file/${encodeURIComponent(file.objectKey)}`);
            const data = await res.json();
            return {
              ...file,
              accessUrl: data?.data?.accessUrl ?? '',
            };
          } catch {
            return {
              ...file,
              accessUrl: '',
            };
          }
        })
      );

      return NextResponse.json({ success: true, data: record, files });
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
