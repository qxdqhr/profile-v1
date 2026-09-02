import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { cookie, save = true } = body as { cookie?: string; save?: boolean };
  const args: string[] = [];
  if (cookie) args.push("--cookie", cookie);
  if (save) args.push("--save");
  const result = await runBilibiliMallScript("01_cookie_login", args);
  return NextResponse.json(result);
}
