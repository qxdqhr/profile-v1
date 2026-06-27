import { NextResponse } from "next/server";
import { runBilibiliMallScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    url,
    projectId,
    screenId,
    skuId,
    payMoney,
    buyerId,
    cookie,
  } = body as {
    url?: string;
    projectId?: number;
    screenId: number;
    skuId: number;
    payMoney?: number;
    buyerId?: number;
    cookie?: string;
  };
  if (!screenId || !skuId) {
    return NextResponse.json({ ok: false, error: "screenId 与 skuId 必填" }, { status: 400 });
  }
  const args = ["--screen-id", String(screenId), "--sku-id", String(skuId)];
  if (url) args.push("--url", url);
  if (projectId) args.push("--project-id", String(projectId));
  if (payMoney !== undefined) args.push("--pay-money", String(payMoney));
  if (buyerId !== undefined) args.push("--buyer-id", String(buyerId));
  if (cookie) args.push("--cookie", cookie);
  const result = await runBilibiliMallScript("05_prepare_order", args);
  return NextResponse.json(result);
}
