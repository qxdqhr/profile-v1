#!/usr/bin/env python3
"""05 - 发货/邮费内容配置"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.shipping import ShippingMode, build_item_post_fee_dto, build_publish_preview


SHIPPING_TEMPLATES: dict[ShippingMode, str] = {
    "包邮": "全国包邮（偏远地区除外，可私聊确认）",
    "按距离计费": "按距离估算运费，下单后按实际距离结算",
    "一口价": "固定邮费，拍下即含运费",
    "无需邮寄": "虚拟/自提类商品，无需快递发货",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="闲鱼发货与邮费配置生成")
    parser.add_argument("--mode", default="包邮", choices=list(SHIPPING_TEMPLATES.keys()))
    parser.add_argument("--post-price", type=float, help="一口价邮费（元）")
    parser.add_argument("--self-pickup", action="store_true", help="支持自提")
    parser.add_argument("--title", default="测试商品")
    parser.add_argument("--desc", default="商品描述")
    parser.add_argument("--price", type=float, default=99.0)
    parser.add_argument("--original-price", type=float)
    args = parser.parse_args()

    mode: ShippingMode = args.mode  # type: ignore[assignment]
    post_fee = build_item_post_fee_dto(
        mode,
        post_price_yuan=args.post_price,
        can_self_pickup=args.self_pickup,
    )
    preview = build_publish_preview(
        title=args.title,
        description=args.desc,
        price_yuan=args.price,
        original_price_yuan=args.original_price,
        shipping_mode=mode,
        post_price_yuan=args.post_price,
        can_self_pickup=args.self_pickup,
    )

    result = {
        "ok": True,
        "shipping_mode": mode,
        "shipping_note": SHIPPING_TEMPLATES[mode],
        "item_post_fee_dto": post_fee,
        "buyer_facing_text": _buyer_text(mode, args.post_price, args.self_pickup),
        "publish_preview": preview,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def _buyer_text(mode: ShippingMode, post_price: float | None, self_pickup: bool) -> str:
    lines = ["【发货方式】"]
    if mode == "包邮":
        lines.append("快递发货，全国包邮")
    elif mode == "按距离计费":
        lines.append("快递发货，运费按距离计算")
    elif mode == "一口价":
        price = post_price or 0
        lines.append(f"快递发货，邮费 ¥{price:.2f}")
    else:
        lines.append("无需邮寄/线上交付")

    if self_pickup:
        lines.append("支持自提，可私聊约时间地点")
    lines.append("通常 48 小时内发出，节假日顺延")
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
