import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { vocaloidBoothTestRuntime } from '@/lib/vocaloidBoothTestRuntime';

function testApiAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.VOCALOID_BOOTH_TEST_API === '1';
}

async function requireTestAccess(request: NextRequest) {
  if (!testApiAllowed()) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: '未授权的访问' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireTestAccess(request);
  if (denied) return denied;

  return NextResponse.json({
    success: true,
    message: 'vocaloid booth test route ready',
    auditEvents: vocaloidBoothTestRuntime.auditSink.list().slice(-10),
  });
}

export async function POST(request: NextRequest) {
  const denied = await requireTestAccess(request);
  if (denied) return denied;

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
        ]).map((file: {
          fileName?: string;
          objectKey?: string;
          size?: number;
          mimeType?: string;
          checksum?: string;
          kind?: string;
        }) => ({
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
