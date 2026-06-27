import { NextResponse } from "next/server";
import { runBaiduPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, surl, pwd, cookie, save = true } = body as {
    url?: string;
    surl?: string;
    pwd: string;
    cookie?: string;
    save?: boolean;
  };

  if (!pwd) {
    return NextResponse.json({ ok: false, error: "pwd 必填" }, { status: 400 });
  }

  const args = ["--pwd", pwd];
  if (url) args.push("--url", url);
  if (surl) args.push("--surl", surl);
  if (cookie) args.push("--cookie", cookie);
  if (save) args.push("--save");

  const result = await runBaiduPanScript("03_verify_extract_code", args);
  return NextResponse.json(result);
}
