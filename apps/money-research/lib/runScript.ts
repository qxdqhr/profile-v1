import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function resolveDemoRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), "demo"),
    path.resolve(process.cwd(), "apps/money-research/demo"),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "xianyu", "scripts"))) {
      return candidate;
    }
  }
  return candidates[0];
}

const DEMO_ROOT = resolveDemoRoot();
const PYTHON = path.join(DEMO_ROOT, ".venv", "bin", "python");
const SYSTEM_PYTHON = "python3";

export type XianyuScript =
  | "01_cookie_login"
  | "02_sign"
  | "03_copywriting"
  | "04_publish_item"
  | "05_shipping";

export type BaiduPanScript =
  | "01_cookie_login"
  | "02_parse_share_link"
  | "03_verify_extract_code"
  | "04_transfer_save"
  | "05_create_share"
  | "06_pipeline";

export type QuarkPanScript =
  | "01_cookie_login"
  | "02_parse_share_link"
  | "03_verify_extract_code"
  | "04_transfer_save"
  | "05_create_share"
  | "06_pipeline";

export type XiaohongshuScript =
  | "01_cookie_login"
  | "02_sign"
  | "03_copywriting"
  | "04_upload_image"
  | "05_publish_note"
  | "06_pipeline";

export type BilibiliMallScript =
  | "01_cookie_login"
  | "02_bili_ticket"
  | "03_parse_link"
  | "04_list_inventory"
  | "05_prepare_order"
  | "06_pipeline";

type RunResult = {
  ok: boolean;
  code: number;
  stdout: string;
  stderr: string;
  data?: unknown;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await import("node:fs/promises").then((fs) => fs.access(filePath));
    return true;
  } catch {
    return false;
  }
}

async function runPythonScript(
  topicRoot: string,
  script: string,
  args: string[] = [],
): Promise<RunResult> {
  const scriptPath = path.join(topicRoot, "scripts", `${script}.py`);
  const pythonBin = (await fileExists(PYTHON)) ? PYTHON : SYSTEM_PYTHON;

  return new Promise((resolve) => {
    const child = spawn(pythonBin, [scriptPath, ...args], {
      cwd: topicRoot,
      env: { ...process.env, PYTHONUTF8: "1" },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("close", (code) => {
      const exitCode = code ?? 1;
      let data: unknown;
      try {
        data = JSON.parse(stdout);
      } catch {
        data = undefined;
      }
      resolve({
        ok: exitCode === 0,
        code: exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        data,
      });
    });
  });
}

export function runXianyuScript(script: XianyuScript, args: string[] = []) {
  return runPythonScript(path.join(DEMO_ROOT, "xianyu"), script, args);
}

export function runBaiduPanScript(script: BaiduPanScript, args: string[] = []) {
  return runPythonScript(path.join(DEMO_ROOT, "baidu-pan"), script, args);
}

export function runQuarkPanScript(script: QuarkPanScript, args: string[] = []) {
  return runPythonScript(path.join(DEMO_ROOT, "quark-pan"), script, args);
}

export function runXiaohongshuScript(script: XiaohongshuScript, args: string[] = []) {
  return runPythonScript(path.join(DEMO_ROOT, "xiaohongshu"), script, args);
}

export function runBilibiliMallScript(script: BilibiliMallScript, args: string[] = []) {
  return runPythonScript(path.join(DEMO_ROOT, "bilibili-mall"), script, args);
}
