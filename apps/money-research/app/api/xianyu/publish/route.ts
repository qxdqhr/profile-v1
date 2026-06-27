import { NextResponse } from "next/server";
import { runXianyuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    cookie,
    name,
    title,
    desc,
    price,
    originalPrice,
    shippingMode = "包邮",
    postPrice,
    selfPickup = false,
    dryRun = true,
    saveCookie = false,
  } = body as {
    cookie?: string;
    name?: string;
    title?: string;
    desc?: string;
    price: number;
    originalPrice?: number;
    shippingMode?: string;
    postPrice?: number;
    selfPickup?: boolean;
    dryRun?: boolean;
    saveCookie?: boolean;
  };

  if (price === undefined || Number.isNaN(Number(price))) {
    return NextResponse.json({ ok: false, error: "price 必填" }, { status: 400 });
  }

  const args = ["--price", String(price), "--shipping-mode", shippingMode];
  if (cookie) args.push("--cookie", cookie);
  if (name) args.push("--name", name);
  if (title) args.push("--title", title);
  if (desc) args.push("--desc", desc);
  if (originalPrice !== undefined) args.push("--original-price", String(originalPrice));
  if (postPrice !== undefined) args.push("--post-price", String(postPrice));
  if (selfPickup) args.push("--self-pickup");
  if (dryRun) args.push("--dry-run");
  if (saveCookie) args.push("--save-cookie");

  const result = await runXianyuScript("04_publish_item", args);
  return NextResponse.json(result);
}
