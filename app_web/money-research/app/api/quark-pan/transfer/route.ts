import { NextResponse } from "next/server";
import { runQuarkPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { url, pwd, path = "/转存调研", cookie, saveCookie = true } = body as {
    url: string;
    pwd?: string;
    path?: string;
    cookie?: string;
    saveCookie?: boolean;
  };
  if (!url) return NextResponse.json({ ok: false, error: "url 必填" }, { status: 400 });
  const args = ["--url", url, "--path", path];
  if (pwd) args.push("--pwd", pwd);
  if (cookie) args.push("--cookie", cookie);
  if (saveCookie) args.push("--save-cookie");
  const result = await runQuarkPanScript("04_transfer_save", args);
  return NextResponse.json(result);
}
