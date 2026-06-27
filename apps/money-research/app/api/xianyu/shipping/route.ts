import { NextResponse } from "next/server";
import { runXianyuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    mode = "包邮",
    postPrice,
    selfPickup = false,
    title = "测试商品",
    desc = "商品描述",
    price = 99,
    originalPrice,
  } = body as {
    mode?: string;
    postPrice?: number;
    selfPickup?: boolean;
    title?: string;
    desc?: string;
    price?: number;
    originalPrice?: number;
  };

  const args = ["--mode", mode, "--title", title, "--desc", desc, "--price", String(price)];
  if (postPrice !== undefined) args.push("--post-price", String(postPrice));
  if (originalPrice !== undefined) args.push("--original-price", String(originalPrice));
  if (selfPickup) args.push("--self-pickup");

  const result = await runXianyuScript("05_shipping", args);
  return NextResponse.json(result);
}
