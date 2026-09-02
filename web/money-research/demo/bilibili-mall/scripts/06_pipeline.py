#!/usr/bin/env python3
"""06 - 全流程：解析 → 选票 → 预下单"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BilibiliMallClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="B 站会员购/票务全流程")
    parser.add_argument("--url", required=True, help="票务或市集链接")
    parser.add_argument("--screen-id", type=int)
    parser.add_argument("--sku-id", type=int)
    parser.add_argument("--dry-run", action="store_true", help="仅预览，不调用 prepare")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = BilibiliMallClient(cookies or None)

    result = client.pipeline(
        url=args.url,
        screen_id=args.screen_id,
        sku_id=args.sku_id,
        dry_run=args.dry_run or not cookies,
    )

    if args.save_cookie and cookies and client.cookies:
        save_cookies(Path(args.cookie_file), client.cookies)
        result["saved_to"] = str(args.cookie_file)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
