#!/usr/bin/env python3
"""02 - 解析分享链接并抓取元数据"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BaiduPanClient
from lib.cookies import load_cookies, parse_cookie_string
from lib.share_parser import parse_share_url

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="解析百度网盘分享链接")
    parser.add_argument("--url", required=True, help="分享链接")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    try:
        parsed = parse_share_url(args.url)
    except ValueError as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = BaiduPanClient(cookies) if cookies else BaiduPanClient({})

    try:
        meta = client.parse_share_link(args.url)
        result = {"ok": True, "parsed_link": parsed.__dict__, "meta": meta}
    except Exception as exc:  # noqa: BLE001
        result = {"ok": False, "parsed_link": parsed.__dict__, "error": str(exc)}

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
