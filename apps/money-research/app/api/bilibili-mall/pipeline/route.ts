import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    url,
    screenId,
    skuId,
    dryRun = true,
    cookie,
    saveCookie = false,
  } = body as {
    url: string;
    screenId?: number;
    skuId?: number;
    dryRun?: boolean;
    cookie?: string;
    saveCookie?: boolean;
  };
  if (!url) return NextResponse.json({ ok: false, error: "url 必填" }, { status: 400 });
  const args = ["--url", url];
  if (screenId) args.push("--screen-id", String(screenId));
  if (skuId) args.push("--sku-id", String(skuId));
  if (dryRun) args.push("--dry-run");
  if (cookie) args.push("--cookie", cookie);
  if (saveCookie) args.push("--save-cookie");
  const result = await runBilibiliMallScript("06_pipeline", args);
  return NextResponse.json(result);
}
