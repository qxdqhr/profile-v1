#!/usr/bin/env python3
"""03 - 提取码验证，获取 stoken"""

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
    parser = argparse.ArgumentParser(description="夸克网盘提取码验证")
    parser.add_argument("--url")
    parser.add_argument("--pwd-id")
    parser.add_argument("--pwd", default="")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    if args.url:
        pwd_id = parse_share_url(args.url).pwd_id
        pwd = args.pwd or parse_share_url(args.url).passcode
    elif args.pwd_id:
        pwd_id = args.pwd_id
        pwd = args.pwd
    else:
        print(json.dumps({"ok": False, "error": "需要 --url 或 --pwd-id"}, ensure_ascii=False))
        return 1

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = QuarkPanClient(cookies)
    result = client.verify_passcode(pwd_id, pwd)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
