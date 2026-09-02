import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { cookie, csrf } = body as { cookie?: string; csrf?: string };
  const args: string[] = [];
  if (cookie) args.push("--cookie", cookie);
  if (csrf) args.push("--csrf", csrf);
  const result = await runBilibiliMallScript("02_bili_ticket", args);
  return NextResponse.json(result);
}
