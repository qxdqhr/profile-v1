import { NextResponse } from "next/server";
import { runXiaohongshuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { image, cookie } = body as { image?: string; cookie?: string };
  const args: string[] = [];
  if (image) args.push("--image", image);
  if (cookie) args.push("--cookie", cookie);
  const result = await runXiaohongshuScript("04_upload_image", args);
  return NextResponse.json(result);
}
