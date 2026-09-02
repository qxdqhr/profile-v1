import { NextResponse } from 'next/server';
import crypto from 'crypto';

const HOST = 'iat-api.xfyun.cn';
const PATH = '/v2/iat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const appId = process.env.XFYUN_APP_ID;
  const apiKey = process.env.XFYUN_API_KEY;
  const apiSecret = process.env.XFYUN_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error: 'Missing XFYUN_APP_ID / XFYUN_API_KEY / XFYUN_API_SECRET',
      },
      { status: 500 }
    );
  }

  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${HOST}\ndate: ${date}\nGET ${PATH} HTTP/1.1`;
  const signatureSha = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  const url = `wss://${HOST}${PATH}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(
    date
  )}&host=${HOST}`;

  return NextResponse.json({ url, appId });
}
