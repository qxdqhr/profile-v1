import { NextResponse } from "next/server";
import { runXiaohongshuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    title,
    desc,
    topic = "生活记录",
    images = [],
    isPrivate = false,
    dryRun = true,
    cookie,
  } = body as {
    title?: string;
    desc?: string;
    topic?: string;
    images?: string[];
    isPrivate?: boolean;
    dryRun?: boolean;
    cookie?: string;
  };
  const args = ["--topic", topic];
  if (title) args.push("--title", title);
  if (desc) args.push("--desc", desc);
  for (const img of images) args.push("--images", img);
  if (isPrivate) args.push("--private");
  if (dryRun) args.push("--dry-run");
  if (cookie) args.push("--cookie", cookie);
  const result = await runXiaohongshuScript("05_publish_note", args);
  return NextResponse.json(result);
}
