#!/usr/bin/env python3
"""02 - Web x-s / x-t 签名生成"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.cookies import load_cookies, parse_cookie_string
from lib.sign import generate_sign_headers

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"
DEFAULT_URI = "/api/sns/web/v2/user/me"


def main() -> int:
    parser = argparse.ArgumentParser(description="小红书 Web 请求签名工具")
    parser.add_argument("--uri", default=DEFAULT_URI, help="API 路径")
    parser.add_argument("--data", default="{}", help="POST body JSON")
    parser.add_argument("--cookie", help="用于读取 a1 字段")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--a1", help="直接指定 a1，优先于 cookie")
    args = parser.parse_args()

    a1 = args.a1 or ""
    if not a1 and args.cookie:
        a1 = parse_cookie_string(args.cookie).get("a1", "")
    if not a1:
        cookies = load_cookies(Path(args.cookie_file))
        a1 = cookies.get("a1", "")

    try:
        data_obj = json.loads(args.data) if args.data.strip() else None
    except json.JSONDecodeError as exc:
        print(json.dumps({"ok": False, "error": f"data JSON 无效: {exc}"}, ensure_ascii=False))
        return 1

    headers = generate_sign_headers(args.uri, data_obj, a1=a1)
    payload = {
        "ok": True,
        "uri": args.uri,
        "a1": a1 or "(未提供，签名仍可演示)",
        "headers": headers,
        "formula": "xhs.help.sign(uri, data, a1=...)",
        "self_test_uri": "/api/sns/web/v1/user/selfinfo",
        "self_test": generate_sign_headers("/api/sns/web/v1/user/selfinfo", None, a1=a1 or "demo_a1"),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
