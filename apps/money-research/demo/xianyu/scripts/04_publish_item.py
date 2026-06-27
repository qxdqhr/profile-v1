#!/usr/bin/env python3
"""04 - 上架商品（图片上传 + 类目 + 地址 + 发品）"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.client import XianyuMtopClient
from lib.cookies import load_cookies, parse_cookie_string, save_cookies
from lib.copywriting import build_listing_copy
from lib.shipping import ShippingMode, build_item_post_fee_dto

DEFAULT_COOKIE_FILE = ROOT / "data" / "cookies.json"
DEFAULT_IMAGE = ROOT / "assets" / "sample.jpg"


def _image_info_from_upload(upload_res: dict[str, Any]) -> dict[str, Any]:
    obj = upload_res.get("object") or {}
    width, height = 800, 800
    pix = obj.get("pix")
    if pix and "x" in str(pix):
        w, h = str(pix).split("x", 1)
        width, height = int(w), int(h)
    return {
        "url": obj["url"],
        "width": width,
        "height": height,
    }


def _image_infos_payload(images: list[dict[str, Any]]) -> list[dict[str, Any]]:
    payload = []
    for index, image in enumerate(images):
        payload.append(
            {
                "extraInfo": {"isH": "false", "isT": "false", "raw": "false"},
                "isQrCode": False,
                "url": image["url"],
                "heightSize": image["height"],
                "widthSize": image["width"],
                "major": index == 0,
                "type": 0,
                "status": "done",
            }
        )
    return payload


def _label_ext_list(channel_res: dict[str, Any]) -> list[dict[str, Any]]:
    labels: list[dict[str, Any]] = []
    data = channel_res.get("data") or {}
    for card in data.get("cardList", []):
        card_data = card.get("cardData") or {}
        values = card_data.get("valuesList") or []
        for card_value in values:
            if card_value.get("isClicked"):
                labels.append(
                    {
                        "channelCateName": card_value.get("catName"),
                        "valueId": None,
                        "channelCateId": card_value.get("channelCatId"),
                        "valueName": None,
                        "tbCatId": card_value.get("tbCatId"),
                        "subPropertyId": None,
                        "labelType": "common",
                        "subValueId": None,
                        "labelId": None,
                        "propertyName": card_data.get("propertyName"),
                        "isUserClick": "1",
                        "isUserCancel": None,
                        "from": "newPublishChoice",
                        "propertyId": card_data.get("propertyId"),
                        "labelFrom": "newPublish",
                        "text": card_value.get("catName"),
                        "properties": (
                            f"{card_data.get('propertyId')}##{card_data.get('propertyName')}:"
                            f"{card_value.get('channelCatId')}##{card_value.get('catName')}"
                        ),
                    }
                )
                break
    return labels


def publish(
    client: XianyuMtopClient,
    *,
    title: str,
    description: str,
    price_yuan: float,
    original_price_yuan: float | None,
    image_paths: list[str],
    shipping_mode: ShippingMode,
    post_price_yuan: float | None,
    can_self_pickup: bool,
    longitude: float,
    latitude: float,
    dry_run: bool,
) -> dict[str, Any]:
    uploaded_images: list[dict[str, Any]] = []
    for path in image_paths:
        upload_res = client.upload_image(path)
        if "object" not in upload_res:
            return {"ok": False, "step": "upload_image", "response": upload_res}
        uploaded_images.append(_image_info_from_upload(upload_res))

    image_infos = _image_infos_payload(uploaded_images)
    channel_res = client.recommend_category(title, description, image_infos)
    if not (channel_res.get("data") or {}).get("categoryPredictResult"):
        return {"ok": False, "step": "recommend_category", "response": channel_res}

    location_res = client.get_default_location(longitude, latitude)
    addresses = (location_res.get("data") or {}).get("commonAddresses") or []
    if not addresses:
        return {"ok": False, "step": "get_location", "response": location_res}

    addr = addresses[0]
    cat = channel_res["data"]["categoryPredictResult"]

    publish_body: dict[str, Any] = {
        "freebies": False,
        "itemTypeStr": "b",
        "quantity": "1",
        "simpleItem": "true",
        "imageInfoDOList": image_infos,
        "itemTextDTO": {
            "desc": description,
            "title": title,
            "titleDescSeparate": True,
        },
        "itemLabelExtList": _label_ext_list(channel_res),
        "itemPriceDTO": {"priceInCent": str(int(round(price_yuan * 100)))},
        "userRightsProtocols": [{"enable": False, "serviceCode": "SKILL_PLAY_NO_MIND"}],
        "itemPostFeeDTO": build_item_post_fee_dto(
            shipping_mode,
            post_price_yuan=post_price_yuan,
            can_self_pickup=can_self_pickup,
        ),
        "itemAddrDTO": {
            "area": addr.get("area"),
            "city": addr.get("city"),
            "divisionId": addr.get("divisionId"),
            "gps": f"{addr.get('longitude')},{addr.get('latitude')}",
            "poiId": addr.get("poiId"),
            "poiName": addr.get("poi"),
            "prov": addr.get("prov"),
        },
        "defaultPrice": False,
        "itemCatDTO": {
            "catId": str(cat.get("catId")),
            "catName": str(cat.get("catName")),
            "channelCatId": str(cat.get("channelCatId")),
            "tbCatId": str(cat.get("tbCatId")),
        },
        "uniqueCode": str(int(time.time() * 1000)),
        "sourceId": "pcMainPublish",
        "bizcode": "pcMainPublish",
        "publishScene": "pcMainPublish",
    }

    if original_price_yuan and original_price_yuan > 0:
        publish_body["itemPriceDTO"]["origPriceInCent"] = str(int(round(original_price_yuan * 100)))

    if dry_run:
        return {
            "ok": True,
            "dry_run": True,
            "publish_body": publish_body,
            "category": cat,
            "address": addr,
            "uploaded_images": uploaded_images,
        }

    publish_res = client.publish_item(publish_body)
    success = any("SUCCESS" in str(x) for x in (publish_res.get("ret") or []))
    return {
        "ok": success,
        "dry_run": False,
        "publish_response": publish_res,
        "publish_body": publish_body,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="闲鱼商品上架")
    parser.add_argument("--cookie")
    parser.add_argument("--cookie-file", default=str(DEFAULT_COOKIE_FILE))
    parser.add_argument("--name", help="商品名，用于自动生成文案")
    parser.add_argument("--title")
    parser.add_argument("--desc")
    parser.add_argument("--price", type=float, required=True)
    parser.add_argument("--original-price", type=float)
    parser.add_argument("--images", nargs="+", default=[str(DEFAULT_IMAGE)])
    parser.add_argument("--shipping-mode", default="包邮", choices=["包邮", "按距离计费", "一口价", "无需邮寄"])
    parser.add_argument("--post-price", type=float, help="一口价邮费（元）")
    parser.add_argument("--self-pickup", action="store_true")
    parser.add_argument("--longitude", type=float, default=118.782483)
    parser.add_argument("--latitude", type=float, default=31.916292)
    parser.add_argument("--dry-run", action="store_true", help="只组装请求体，不真正发品")
    parser.add_argument("--save-cookie", action="store_true")
    args = parser.parse_args()

    cookies = parse_cookie_string(args.cookie) if args.cookie else load_cookies(Path(args.cookie_file))
    if not cookies:
        print(json.dumps({"ok": False, "error": "缺少 Cookie"}, ensure_ascii=False))
        return 1

    if args.title and args.desc:
        title, description = args.title, args.desc
    else:
        copy = build_listing_copy(
            product_name=args.name or args.title or "测试商品",
            price_yuan=args.price,
            original_price_yuan=args.original_price,
        )
        title = args.title or copy["title"]
        description = args.desc or copy["description"]

    image_paths = [str(Path(p)) for p in args.images]
    for path in image_paths:
        if not Path(path).exists():
            print(json.dumps({"ok": False, "error": f"图片不存在: {path}"}, ensure_ascii=False))
            return 1

    client = XianyuMtopClient(cookies)
    client.refresh_token()

    result = publish(
        client,
        title=title,
        description=description,
        price_yuan=args.price,
        original_price_yuan=args.original_price,
        image_paths=image_paths,
        shipping_mode=args.shipping_mode,  # type: ignore[arg-type]
        post_price_yuan=args.post_price,
        can_self_pickup=args.self_pickup,
        longitude=args.longitude,
        latitude=args.latitude,
        dry_run=args.dry_run,
    )

    if args.save_cookie:
        save_cookies(Path(args.cookie_file), client.cookies)
        result["cookie_saved"] = True

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
