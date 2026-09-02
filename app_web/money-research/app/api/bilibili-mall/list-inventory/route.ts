import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, projectId, c2cItemsId, market = false, cookie } = body as {
    url?: string;
    projectId?: number;
    c2cItemsId?: number;
    market?: boolean;
    cookie?: string;
  };
  const args: string[] = [];
  if (market) args.push("--market");
  if (url) args.push("--url", url);
  if (projectId) args.push("--project-id", String(projectId));
  if (c2cItemsId) args.push("--c2c-items-id", String(c2cItemsId));
  if (cookie) args.push("--cookie", cookie);
  const result = await runBilibiliMallScript("04_list_inventory", args);
  return NextResponse.json(result);
}
