#!/usr/bin/env python3
"""05 - 发布图文笔记"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import XiaohongshuClient
from lib.cookies import load_cookies, parse_cookie_string
from lib.copywriting import build_note_copy

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"
DEFAULT_IMAGE = ROOT / "assets" / "sample.jpg"


def main() -> int:
    parser = argparse.ArgumentParser(description="小红书图文笔记发布")
    parser.add_argument("--title", help="标题（≤20字）")
    parser.add_argument("--desc", help="正文")
    parser.add_argument("--topic", default="生活记录", help="无 title/desc 时用于生成文案")
    parser.add_argument("--images", nargs="*", default=[str(DEFAULT_IMAGE)])
    parser.add_argument("--private", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    args = parser.parse_args()

    if args.title and args.desc:
        title, desc, topics = args.title, args.desc, [args.topic]
    else:
        copy = build_note_copy(topic=args.topic)
        title, desc, topics = copy["title"], copy["desc"], copy["topics"]

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies and not args.dry_run:
        print(json.dumps({"ok": False, "error": "未提供 Cookie"}, ensure_ascii=False))
        return 1

    if args.dry_run:
        client_preview = {
            "ok": True,
            "dry_run": True,
            "preview": {
                "title": title[:20],
                "desc": desc,
                "images": args.images,
                "topics": topics,
                "is_private": args.private,
            },
        }
        print(json.dumps(client_preview, ensure_ascii=False, indent=2))
        return 0

    client = XiaohongshuClient(cookies)
    login = client.check_login()
    if not login.get("logged_in"):
        print(json.dumps({**login, "ok": False}, ensure_ascii=False, indent=2))
        return 1

    result = client.publish_image_note(
        title=title,
        desc=desc,
        image_paths=args.images,
        topics=topics,
        is_private=args.private,
        dry_run=False,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
