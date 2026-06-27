#!/usr/bin/env python3
"""01 - Cookie 登录态检测与 bdstoken 获取"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BaiduPanClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="百度网盘 Cookie 登录检测")
    parser.add_argument("--cookie", help="Cookie 字符串")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save", action="store_true", help="写回 Cookie 文件")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "未提供 Cookie"}, ensure_ascii=False))
        return 1

    missing = [k for k in ("BDUSS",) if k not in cookies]
    if missing:
        print(json.dumps({"ok": False, "error": f"Cookie 缺少关键字段: {', '.join(missing)}"}, ensure_ascii=False))
        return 1

    client = BaiduPanClient(cookies)
    result = client.check_login()
    result["cookies"] = client.cookies
    result["cookie_string"] = client.export_cookie_string()

    if args.save:
        save_cookies(Path(args.cookie_file), client.cookies, extra={"bdstoken": result.get("bdstoken")})
        result["saved_to"] = args.cookie_file

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
