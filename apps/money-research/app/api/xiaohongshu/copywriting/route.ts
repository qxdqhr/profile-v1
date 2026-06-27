import { NextResponse } from "next/server";
import { runXiaohongshuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { topic, mood = "分享", location = "", highlights = [], extra = "" } = body as {
    topic: string;
    mood?: string;
    location?: string;
    highlights?: string[];
    extra?: string;
  };
  if (!topic) return NextResponse.json({ ok: false, error: "topic 必填" }, { status: 400 });
  const args = ["--topic", topic, "--mood", mood, "--location", location, "--extra", extra];
  for (const h of highlights) args.push("--highlights", h);
  const result = await runXiaohongshuScript("03_copywriting", args);
  return NextResponse.json(result);
}
