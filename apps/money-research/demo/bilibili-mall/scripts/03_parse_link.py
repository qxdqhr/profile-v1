#!/usr/bin/env python3
"""03 - 解析票务/市集链接"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import BilibiliMallClient
from lib.link_parser import parse_link

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="解析 B 站会员购/票务链接")
    parser.add_argument("--url", required=True)
    args = parser.parse_args()

    parsed = parse_link(args.url)
    result = {"ok": parsed.link_type != "unknown", "parsed": parsed.__dict__}

    client = BilibiliMallClient()
    if parsed.link_type == "show_project" and parsed.project_id:
        result["preview"] = client.get_project_info(parsed.project_id)
    elif parsed.link_type == "mall_item" and parsed.c2c_items_id:
        result["preview"] = client.get_market_item(parsed.c2c_items_id)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
