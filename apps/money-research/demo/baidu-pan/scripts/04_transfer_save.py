#!/usr/bin/env python3
"""04 - 分享资源转存到 Cookie 账号网盘"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BaiduPanClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies
from lib.share_parser import parse_share_url

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="百度网盘分享转存")
    parser.add_argument("--url", required=True, help="分享链接")
    parser.add_argument("--pwd", help="提取码")
    parser.add_argument("--path", default="/转存调研", help="保存目录")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies.get("BDUSS"):
        print(json.dumps({"ok": False, "error": "缺少登录 Cookie (BDUSS)"}, ensure_ascii=False))
        return 1

    parsed = parse_share_url(args.url)
    pwd = args.pwd or parsed.pwd
    client = BaiduPanClient(cookies)

    meta = client.parse_share_link(args.url)
    sekey = ""
    shareid = meta["shareid"]
    uk = meta["uk"]
    referer = f"https://pan.baidu.com/s/1{parsed.surl}"

    if meta.get("need_pass") or pwd:
        if not pwd:
            print(json.dumps({"ok": False, "error": "需要提取码"}, ensure_ascii=False))
            return 1
        verify = client.verify_extract_code(parsed.surl, pwd)
        if not verify.get("ok"):
            print(json.dumps({"ok": False, "step": "verify", "result": verify}, ensure_ascii=False))
            return 2
        sekey = verify["randsk"]
        listing = client.list_share_files(shareid, uk, sekey, parsed.surl)
        if not listing.get("ok"):
            print(json.dumps({"ok": False, "step": "list", "result": listing}, ensure_ascii=False))
            return 2
        fs_ids = listing["fs_ids"]
        shareid = listing["share_id"]
        uk = listing["uk"]
    else:
        fs_ids = [f["fs_id"] for f in meta.get("files", [])]

    if not fs_ids:
        print(json.dumps({"ok": False, "error": "未找到 fs_id"}, ensure_ascii=False))
        return 2

    folder = client.ensure_folder(args.path)
    transfer = client.transfer_save(
        shareid=shareid,
        uk=uk,
        sekey=sekey,
        fs_ids=fs_ids,
        save_path=args.path,
        referer=referer,
    )

    if args.save_cookie:
        save_cookies(Path(args.cookie_file), client.cookies)

    result = {
        "ok": transfer.get("ok", False),
        "save_path": args.path,
        "fs_ids": fs_ids,
        "folder": folder,
        "transfer": transfer,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
