import { NextResponse } from "next/server";
import { runQuarkPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, cookie } = body as { url: string; cookie?: string };
  if (!url) return NextResponse.json({ ok: false, error: "url 必填" }, { status: 400 });
  const args = ["--url", url];
  if (cookie) args.push("--cookie", cookie);
  const result = await runQuarkPanScript("02_parse_share_link", args);
  return NextResponse.json(result);
}
