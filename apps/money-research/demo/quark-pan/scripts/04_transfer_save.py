#!/usr/bin/env python3
"""04 - 分享转存到 Cookie 账号网盘"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import QuarkPanClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies
from lib.share_parser import parse_share_url

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="夸克网盘分享转存")
    parser.add_argument("--url", required=True)
    parser.add_argument("--pwd")
    parser.add_argument("--path", default="/转存调研")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "缺少 Cookie"}, ensure_ascii=False))
        return 1

    parsed = parse_share_url(args.url)
    pwd = args.pwd if args.pwd is not None else parsed.passcode
    client = QuarkPanClient(cookies)

    verify = client.verify_passcode(parsed.pwd_id, pwd)
    if not verify.get("ok"):
        print(json.dumps({"ok": False, "step": "verify", "result": verify}, ensure_ascii=False))
        return 2

    listing = client.list_share_files(parsed.pwd_id, verify["stoken"], parsed.pdir_fid)
    if not listing.get("ok"):
        print(json.dumps({"ok": False, "step": "list", "result": listing}, ensure_ascii=False))
        return 2

    folder = client.resolve_folder_fid(args.path)
    transfer = client.transfer_save(
        pwd_id=parsed.pwd_id,
        stoken=verify["stoken"],
        fid_list=listing["fid_list"],
        fid_token_list=listing["fid_token_list"],
        to_pdir_fid=folder["fid"],
        pdir_fid=parsed.pdir_fid,
    )

    if args.save_cookie:
        save_cookies(Path(args.cookie_file), cookies)

    result = {
        "ok": transfer.get("ok", False),
        "save_path": args.path,
        "folder": folder,
        "transfer": transfer,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
