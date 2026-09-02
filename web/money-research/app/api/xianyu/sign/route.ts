import { NextResponse } from "next/server";
import { runXianyuScript } from "@/lib/runScript";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, data = "{}", t, userId } = body as {
    token?: string;
    data?: string;
    t?: string;
    userId?: string;
  };

  const args: string[] = ["--data", data];
  if (token) args.push("--token", token);
  if (t) args.push("--t", t);
  if (userId) args.push("--user-id", userId);

  const result = await runXianyuScript("02_sign", args);
  return NextResponse.json(result);
}
