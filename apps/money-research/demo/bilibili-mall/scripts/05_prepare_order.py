#!/usr/bin/env python3
"""05 - 票务预下单（prepare）"""

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
    parser = argparse.ArgumentParser(description="B 站票务预下单")
    parser.add_argument("--project-id", type=int)
    parser.add_argument("--url", help="票务链接（可替代 project-id）")
    parser.add_argument("--screen-id", type=int, required=True)
    parser.add_argument("--sku-id", type=int, required=True)
    parser.add_argument("--pay-money", type=int, help="金额（分），默认自动从票档读取")
    parser.add_argument("--buyer-id", type=int)
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "未提供 Cookie"}, ensure_ascii=False))
        return 1

    project_id = args.project_id
    if args.url:
        parsed = parse_link(args.url)
        if parsed.project_id:
            project_id = parsed.project_id
    if not project_id:
        print(json.dumps({"ok": False, "error": "缺少 project_id"}, ensure_ascii=False))
        return 1

    client = BilibiliMallClient(cookies)
    login = client.check_login()
    if not login.get("logged_in"):
        print(json.dumps({**login, "ok": False}, ensure_ascii=False, indent=2))
        return 1

    pay_money = args.pay_money
    if pay_money is None:
        inventory = client.list_sessions_summary(project_id)
        for session in inventory.get("sessions", []):
            if session.get("screen_id") != args.screen_id:
                continue
            for ticket in session.get("tickets", []):
                if ticket.get("sku_id") == args.sku_id:
                    pay_money = int((ticket.get("price_yuan") or 0) * 100)
                    break
        pay_money = pay_money or 1

    result = client.prepare_order(
        project_id=project_id,
        screen_id=args.screen_id,
        sku_id=args.sku_id,
        pay_money_fen=pay_money,
        buyer_id=args.buyer_id,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
