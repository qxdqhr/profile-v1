#!/usr/bin/env python3
"""02 - bili_ticket 生成"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.cookies import load_cookies, parse_cookie_string
from lib.ticket import generate_bili_ticket

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="B 站 GenWebTicket")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--csrf", help="直接指定 bili_jct")
    args = parser.parse_args()

    csrf = args.csrf or ""
    if not csrf and args.cookie:
        csrf = parse_cookie_string(args.cookie).get("bili_jct", "")
    if not csrf:
        cookies = load_cookies(Path(args.cookie_file))
        csrf = cookies.get("bili_jct", "")

    result = generate_bili_ticket(csrf)
    result["csrf_provided"] = bool(csrf)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
