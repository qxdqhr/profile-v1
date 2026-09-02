import { NextResponse } from "next/server";
import { runXiaohongshuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { uri, data = "{}", cookie, a1 } = body as {
    uri?: string;
    data?: string;
    cookie?: string;
    a1?: string;
  };
  const args: string[] = ["--data", data];
  if (uri) args.push("--uri", uri);
  if (cookie) args.push("--cookie", cookie);
  if (a1) args.push("--a1", a1);
  const result = await runXiaohongshuScript("02_sign", args);
  return NextResponse.json(result);
}
