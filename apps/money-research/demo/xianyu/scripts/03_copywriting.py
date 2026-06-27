#!/usr/bin/env python3
"""03 - 商品描述文案生成"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.copywriting import build_listing_copy


def main() -> int:
    parser = argparse.ArgumentParser(description="闲鱼商品标题与描述文案生成")
    parser.add_argument("--name", required=True, help="商品名称")
    parser.add_argument("--condition", default="95新", help="成色")
    parser.add_argument("--price", type=float, help="售价（元）")
    parser.add_argument("--original-price", type=float, help="原价（元）")
    parser.add_argument("--reason", default="闲置转让", help="转手原因")
    parser.add_argument("--highlights", nargs="*", default=["功能正常", "配件齐全", "支持验货"])
    parser.add_argument("--defects", nargs="*", default=[])
    parser.add_argument("--notes", default="", help="补充说明")
    args = parser.parse_args()

    result = build_listing_copy(
        product_name=args.name,
        condition=args.condition,
        highlights=args.highlights,
        defects=args.defects,
        price_yuan=args.price,
        original_price_yuan=args.original_price,
        reason=args.reason,
        extra_notes=args.notes,
    )
    result["ok"] = True
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
