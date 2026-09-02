#!/usr/bin/env python3
"""06 - 全流程：分享链接 → 转存 → 生成新分享"""

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
    parser = argparse.ArgumentParser(description="百度网盘转存+再分享全流程")
    parser.add_argument("--url", required=True, help="源分享链接")
    parser.add_argument("--pwd", help="源链接提取码")
    parser.add_argument("--path", default="/转存调研", help="转存目录")
    parser.add_argument("--share-pwd", default="x1y2", help="新分享提取码")
    parser.add_argument("--share-period", type=int, default=7)
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies.get("BDUSS"):
        print(json.dumps({"ok": False, "error": "缺少登录 Cookie"}, ensure_ascii=False))
        return 1

    client = BaiduPanClient(cookies)
    result = client.run_pipeline(
        args.url,
        pwd=args.pwd,
        save_path=args.path,
        share_pwd=args.share_pwd,
        share_period=args.share_period,
    )

    if args.save_cookie:
        save_cookies(Path(args.cookie_file), client.cookies)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
