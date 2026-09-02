import { NextResponse } from "next/server";
import { runQuarkPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { searchName, searchDir = "0", pwd = "x1y2", expireDays = 7, cookie, fids = [] } = body as {
    searchName?: string;
    searchDir?: string;
    pwd?: string;
    expireDays?: number;
    cookie?: string;
    fids?: string[];
  };
  const args = ["--expire-days", String(expireDays), "--pwd", pwd, "--search-dir", searchDir];
  if (cookie) args.push("--cookie", cookie);
  if (searchName) args.push("--search-name", searchName);
  for (const fid of fids) args.push("--fid", fid);
  const result = await runQuarkPanScript("05_create_share", args);
  return NextResponse.json(result);
}
