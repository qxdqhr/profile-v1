#!/usr/bin/env python3
"""04 - 图片上传至创作者素材库"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import XiaohongshuClient
from lib.cookies import load_cookies, parse_cookie_string

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"
DEFAULT_IMAGE = ROOT / "assets" / "sample.jpg"


def main() -> int:
    parser = argparse.ArgumentParser(description="小红书图片上传")
    parser.add_argument("--image", default=str(DEFAULT_IMAGE), help="本地图片路径")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "未提供 Cookie"}, ensure_ascii=False))
        return 1

    client = XiaohongshuClient(cookies)
    login = client.check_login()
    if not login.get("logged_in"):
        print(json.dumps({**login, "ok": False}, ensure_ascii=False, indent=2))
        return 1

    result = client.upload_image(args.image)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
