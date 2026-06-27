#!/usr/bin/env python3
"""05 - 创建新分享链接"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import QuarkPanClient
from lib.cookies import load_cookies, parse_cookie_string

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="夸克网盘创建分享")
    parser.add_argument("--fid", action="append", dest="fids")
    parser.add_argument("--search-dir", default="0", help="在此目录 fid 下按文件名搜索")
    parser.add_argument("--search-name", help="文件名关键词")
    parser.add_argument("--title", default="转存分享")
    parser.add_argument("--pwd", default="x1y2")
    parser.add_argument("--expire-days", type=int, default=7)
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "缺少 Cookie"}, ensure_ascii=False))
        return 1

    client = QuarkPanClient(cookies)
    fids = list(args.fids or [])

    if args.search_name:
        for item in client.list_dir(args.search_dir):
            if args.search_name in str(item.get("file_name", "")):
                fids.append(str(item["fid"]))

    if not fids:
        print(json.dumps({"ok": False, "error": "需要 --fid 或 --search-name"}, ensure_ascii=False))
        return 1

    result = client.create_share(
        fids,
        title=args.title,
        passcode=args.pwd,
        expire_days=args.expire_days,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
