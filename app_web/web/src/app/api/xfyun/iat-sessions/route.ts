import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'xfyun-iat-sessions.jsonl');

type SessionConfig = {
  language: string;
  domain: string;
  accent: string;
  vadEos: number;
  dwa: string;
};

type SessionRecord = {
  id: string;
  createdAt: string;
  duration: number;
  transcript: string;
  config: SessionConfig;
  stats: {
    charCount: number;
    wordCount: number;
  };
};

const readSessions = async (): Promise<SessionRecord[]> => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return content
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as SessionRecord);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

export async function GET() {
  try {
    const sessions = await readSessions();
    sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transcript = (body?.transcript ?? '').toString().trim();
    const duration = Number(body?.duration ?? 0);
    const config = body?.config as SessionConfig | undefined;

    if (!transcript || !config) {
      return NextResponse.json({ error: 'Missing transcript or config' }, { status: 400 });
    }

    const wordCount = transcript.split(/\s+/).filter(Boolean).length;
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      duration: Number.isFinite(duration) ? duration : 0,
      transcript,
      config,
      stats: {
        charCount: transcript.length,
        wordCount,
      },
    };

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(DATA_FILE, `${JSON.stringify(record)}\n`, 'utf-8');

    return NextResponse.json({ record });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
