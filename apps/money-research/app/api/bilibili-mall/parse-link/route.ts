import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url } = body as { url: string };
  if (!url) return NextResponse.json({ ok: false, error: "url 必填" }, { status: 400 });
  const result = await runBilibiliMallScript("03_parse_link", ["--url", url]);
  return NextResponse.json(result);
}
