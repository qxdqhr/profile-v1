#!/usr/bin/env python3
"""04 - 查询场次票档或市集商品"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BilibiliMallClient
from lib.cookies import load_cookies, parse_cookie_string
from lib.link_parser import parse_link

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="查询票档或市集商品")
    parser.add_argument("--url", help="票务/市集链接")
    parser.add_argument("--project-id", type=int, help="直接指定 project_id")
    parser.add_argument("--c2c-items-id", type=int, help="市集商品 id")
    parser.add_argument("--market", action="store_true", help="拉取市集列表")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    client = BilibiliMallClient(cookies or None)

    if args.market:
        result = client.list_market_items()
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result.get("ok") else 1

    project_id = args.project_id
    c2c_id = args.c2c_items_id
    if args.url:
        parsed = parse_link(args.url)
        if parsed.link_type == "show_project":
            project_id = parsed.project_id
        elif parsed.link_type == "mall_item":
            c2c_id = parsed.c2c_items_id

    if project_id:
        result = client.list_sessions_summary(project_id)
    elif c2c_id:
        result = client.get_market_item(c2c_id)
    else:
        print(json.dumps({"ok": False, "error": "请提供 --url、--project-id、--c2c-items-id 或 --market"}, ensure_ascii=False))
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
