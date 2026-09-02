#!/usr/bin/env python3
"""02 - 解析分享链接"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import QuarkPanClient
from lib.cookies import load_cookies, parse_cookie_string
from lib.share_parser import parse_share_url

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="解析夸克网盘分享链接")
    parser.add_argument("--url", required=True)
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    try:
        parsed = parse_share_url(args.url)
    except ValueError as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        return 1

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = QuarkPanClient(cookies) if cookies else QuarkPanClient({})
    meta = client.parse_share_link(args.url)
    result = {"ok": True, "parsed_link": parsed.__dict__, "meta": meta}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
