import { NextResponse } from "next/server";
import { runXiaohongshuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    topic = "周末探店",
    title,
    desc,
    images = [],
    isPrivate = false,
    dryRun = true,
    cookie,
    saveCookie = false,
  } = body as {
    topic?: string;
    title?: string;
    desc?: string;
    images?: string[];
    isPrivate?: boolean;
    dryRun?: boolean;
    cookie?: string;
    saveCookie?: boolean;
  };
  const args = ["--topic", topic];
  if (title) args.push("--title", title);
  if (desc) args.push("--desc", desc);
  for (const img of images) args.push("--images", img);
  if (isPrivate) args.push("--private");
  if (dryRun) args.push("--dry-run");
  if (cookie) args.push("--cookie", cookie);
  if (saveCookie) args.push("--save-cookie");
  const result = await runXiaohongshuScript("06_pipeline", args);
  return NextResponse.json(result);
}
