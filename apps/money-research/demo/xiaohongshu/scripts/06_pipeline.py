#!/usr/bin/env python3
"""06 - 全流程：文案 → 上传 → 发布"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import XiaohongshuClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies
from lib.copywriting import build_note_copy

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"
DEFAULT_IMAGE = ROOT / "assets" / "sample.jpg"


def main() -> int:
    parser = argparse.ArgumentParser(description="小红书发帖全流程")
    parser.add_argument("--topic", default="周末探店", help="文案主题")
    parser.add_argument("--title", help="覆盖自动标题")
    parser.add_argument("--desc", help="覆盖自动正文")
    parser.add_argument("--images", nargs="*", default=[str(DEFAULT_IMAGE)])
    parser.add_argument("--private", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="仅预览不发布")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    copy = build_note_copy(topic=args.topic)
    title = (args.title or copy["title"])[:20]
    desc = args.desc or copy["desc"]
    topics = copy["topics"]

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))

    steps: dict[str, object] = {
        "copywriting": {"title": title, "desc": desc, "topics": topics},
    }

    if args.dry_run:
        steps["publish"] = {
            "dry_run": True,
            "preview": {
                "title": title,
                "desc": desc,
                "images": args.images,
                "topics": topics,
                "is_private": args.private,
            },
        }
        print(json.dumps({"ok": True, "dry_run": True, "steps": steps}, ensure_ascii=False, indent=2))
        return 0

    if not cookies:
        print(json.dumps({"ok": False, "error": "未提供 Cookie", "steps": steps}, ensure_ascii=False))
        return 1

    client = XiaohongshuClient(cookies)
    login = client.check_login()
    steps["login"] = login
    if not login.get("logged_in"):
        print(json.dumps({"ok": False, "steps": steps}, ensure_ascii=False, indent=2))
        return 1

    upload_results = []
    for image in args.images:
        upload_results.append(client.upload_image(image))
    steps["upload"] = upload_results
    if not all(item.get("ok") for item in upload_results):
        print(json.dumps({"ok": False, "steps": steps}, ensure_ascii=False, indent=2))
        return 1

    publish = client.publish_image_note(
        title=title,
        desc=desc,
        image_paths=args.images,
        topics=topics,
        is_private=args.private,
        dry_run=False,
    )
    steps["publish"] = publish

    if args.save_cookie:
        save_cookies(
            Path(args.cookie_file),
            client.cookies,
            extra={"nickname": login.get("nickname"), "user_id": login.get("user_id")},
        )
        steps["saved_to"] = args.cookie_file

    ok = bool(publish.get("ok"))
    print(json.dumps({"ok": ok, "steps": steps}, ensure_ascii=False, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
