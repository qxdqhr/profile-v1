#!/usr/bin/env python3
"""03 - 提取码验证，获取 randsk / BDCLND"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BaiduPanClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies
from lib.share_parser import parse_share_url

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="验证百度网盘分享提取码")
    parser.add_argument("--url", help="分享链接（与 --surl 二选一）")
    parser.add_argument("--surl", help="短链 surl")
    parser.add_argument("--pwd", required=True, help="提取码")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save", action="store_true")
    args = parser.parse_args()

    if args.url:
        surl = parse_share_url(args.url).surl
    elif args.surl:
        surl = args.surl
    else:
        print(json.dumps({"ok": False, "error": "需要 --url 或 --surl"}, ensure_ascii=False))
        return 1

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = BaiduPanClient(cookies)
    result = client.verify_extract_code(surl, args.pwd)

    if args.save and result.get("ok"):
        save_cookies(Path(args.cookie_file), client.cookies)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
