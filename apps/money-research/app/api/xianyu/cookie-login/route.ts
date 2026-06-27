import { NextResponse } from "next/server";
import { runXianyuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { cookie, refresh = true, save = true } = body as {
    cookie?: string;
    refresh?: boolean;
    save?: boolean;
  };

  const args: string[] = [];
  if (cookie) args.push("--cookie", cookie);
  if (refresh) args.push("--refresh");
  if (save) args.push("--save");

  const result = await runXianyuScript("01_cookie_login", args);
  return NextResponse.json(result);
}
