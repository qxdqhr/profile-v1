import { NextResponse } from "next/server";
import { runQuarkPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, pwd, cookie } = body as { url?: string; pwd: string; cookie?: string };
  if (!pwd) return NextResponse.json({ ok: false, error: "pwd 必填" }, { status: 400 });
  const args = ["--pwd", pwd];
  if (url) args.push("--url", url);
  if (cookie) args.push("--cookie", cookie);
  const result = await runQuarkPanScript("03_verify_extract_code", args);
  return NextResponse.json(result);
}
