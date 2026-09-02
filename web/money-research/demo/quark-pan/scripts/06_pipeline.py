#!/usr/bin/env python3
"""06 - 全流程：分享链接 → 转存 → 生成新分享"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import QuarkPanClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="夸克网盘转存+再分享全流程")
    parser.add_argument("--url", required=True)
    parser.add_argument("--pwd")
    parser.add_argument("--path", default="/转存调研")
    parser.add_argument("--share-pwd", default="x1y2")
    parser.add_argument("--share-expire-days", type=int, default=7)
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "缺少 Cookie"}, ensure_ascii=False))
        return 1

    client = QuarkPanClient(cookies)
    result = client.run_pipeline(
        args.url,
        passcode=args.pwd,
        save_path=args.path,
        share_passcode=args.share_pwd,
        expire_days=args.share_expire_days,
    )

    if args.save_cookie:
        save_cookies(Path(args.cookie_file), cookies)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
