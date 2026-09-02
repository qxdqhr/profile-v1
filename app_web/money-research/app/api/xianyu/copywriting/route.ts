import { NextResponse } from "next/server";
import { runXianyuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    condition = "95新",
    price,
    originalPrice,
    reason = "闲置转让",
    highlights = ["功能正常", "配件齐全", "支持验货"],
    defects = [],
    notes = "",
  } = body as {
    name: string;
    condition?: string;
    price?: number;
    originalPrice?: number;
    reason?: string;
    highlights?: string[];
    defects?: string[];
    notes?: string;
  };

  if (!name) {
    return NextResponse.json({ ok: false, error: "name 必填" }, { status: 400 });
  }

  const args = [
    "--name",
    name,
    "--condition",
    condition,
    "--reason",
    reason,
    "--notes",
    notes,
    ...highlights.flatMap((h) => ["--highlights", h]),
    ...defects.flatMap((d) => ["--defects", d]),
  ];
  if (price !== undefined) args.push("--price", String(price));
  if (originalPrice !== undefined) args.push("--original-price", String(originalPrice));

  const result = await runXianyuScript("03_copywriting", args);
  return NextResponse.json(result);
}
