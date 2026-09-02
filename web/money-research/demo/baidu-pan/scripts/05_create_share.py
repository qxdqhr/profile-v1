#!/usr/bin/env python3
"""05 - 为已转存文件创建新的分享链接"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BaiduPanClient
from lib.cookies import load_cookies, parse_cookie_string

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="创建百度网盘分享链接")
    parser.add_argument("--fs-id", action="append", dest="fs_ids", help="文件 fs_id，可重复")
    parser.add_argument("--search", help="按文件名搜索 fs_id")
    parser.add_argument("--pwd", default="", help="分享提取码（4位，可空）")
    parser.add_argument("--period", type=int, default=7, help="有效期天数，0=永久")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies.get("BDUSS"):
        print(json.dumps({"ok": False, "error": "缺少登录 Cookie"}, ensure_ascii=False))
        return 1

    client = BaiduPanClient(cookies)
    fs_ids = list(args.fs_ids or [])

    if args.search:
        files = client.search_file(args.search)
        fs_ids.extend(str(item["fs_id"]) for item in files[:10])

    if not fs_ids:
        print(json.dumps({"ok": False, "error": "需要 --fs-id 或 --search"}, ensure_ascii=False))
        return 1

    result = client.create_share(fs_ids, pwd=args.pwd, period=args.period)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
