import { NextResponse } from "next/server";
import { runBaiduPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    url,
    pwd,
    path = "/转存调研",
    sharePwd = "x1y2",
    sharePeriod = 7,
    cookie,
    saveCookie = true,
  } = body as {
    url: string;
    pwd?: string;
    path?: string;
    sharePwd?: string;
    sharePeriod?: number;
    cookie?: string;
    saveCookie?: boolean;
  };

  if (!url) {
    return NextResponse.json({ ok: false, error: "url 必填" }, { status: 400 });
  }

  const args = [
    "--url",
    url,
    "--path",
    path,
    "--share-pwd",
    sharePwd,
    "--share-period",
    String(sharePeriod),
  ];
  if (pwd) args.push("--pwd", pwd);
  if (cookie) args.push("--cookie", cookie);
  if (saveCookie) args.push("--save-cookie");

  const result = await runBaiduPanScript("06_pipeline", args);
  return NextResponse.json(result);
}
