#!/usr/bin/env python3
"""01 - Cookie 登录态检测与 _m_h5_tk 刷新"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import XianyuMtopClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="闲鱼 Cookie 登录检测与 Token 刷新")
    parser.add_argument("--cookie", help="Cookie 字符串，不传则读取 data/cookies.json")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--refresh", action="store_true", help="强制刷新 _m_h5_tk")
    parser.add_argument("--save", action="store_true", help="将刷新后的 Cookie 写回文件")
    args = parser.parse_args()

    if args.cookie:
        cookies = parse_cookie_string(args.cookie)
    else:
        cookies = load_cookies(Path(args.cookie_file))

    if not cookies:
        print(json.dumps({"ok": False, "error": "未提供 Cookie，请设置 --cookie 或 data/cookies.json"}, ensure_ascii=False))
        return 1

    required = ["cookie2", "unb"]
    missing = [k for k in required if k not in cookies]
    if missing:
        print(json.dumps({"ok": False, "error": f"Cookie 缺少关键字段: {', '.join(missing)}"}, ensure_ascii=False))
        return 1

    client = XianyuMtopClient(cookies)

    login_probe = client.check_login()
    user_info: dict = {}
    token_refresh: dict = {}

    if args.refresh or not cookies.get("_m_h5_tk"):
        token_refresh = client.refresh_token()

    try:
        user_info = client.get_login_user()
    except Exception as exc:  # noqa: BLE001
        user_info = {"error": str(exc)}

    ok = bool(user_info.get("data")) or str(login_probe).find("true") >= 0
    result = {
        "ok": ok,
        "device_id": client.device_id,
        "login_probe": login_probe,
        "token_refresh": token_refresh,
        "user_info": user_info,
        "cookies": client.cookies,
        "cookie_string": client.export_cookie_string(),
    }

    if args.save:
        save_cookies(
            Path(args.cookie_file),
            client.cookies,
            extra={"device_id": client.device_id},
        )
        result["saved_to"] = args.cookie_file

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
