import { NextResponse } from "next/server";
import { runBaiduPanScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    fsIds = [],
    search,
    pwd = "",
    period = 7,
    cookie,
  } = body as {
    fsIds?: string[];
    search?: string;
    pwd?: string;
    period?: number;
    cookie?: string;
  };

  const args = ["--period", String(period)];
  if (cookie) args.push("--cookie", cookie);
  if (pwd) args.push("--pwd", pwd);
  if (search) args.push("--search", search);
  for (const id of fsIds) args.push("--fs-id", id);

  const result = await runBaiduPanScript("05_create_share", args);
  return NextResponse.json(result);
}
