"""发货/邮费配置构建"""

from __future__ import annotations

from typing import Any, Literal

ShippingMode = Literal["包邮", "按距离计费", "一口价", "无需邮寄"]


def build_item_post_fee_dto(
    mode: ShippingMode,
    *,
    post_price_yuan: float | None = None,
    can_self_pickup: bool = False,
) -> dict[str, Any]:
    dto: dict[str, Any] = {
        "canFreeShipping": False,
        "supportFreight": False,
        "onlyTakeSelf": bool(can_self_pickup),
    }

    if mode == "包邮":
        dto["canFreeShipping"] = True
        dto["supportFreight"] = True
    elif mode == "按距离计费":
        dto["supportFreight"] = True
        dto["templateId"] = "-100"
    elif mode == "一口价":
        if post_price_yuan is None:
            raise ValueError("一口价邮费模式需要提供 post_price_yuan")
        dto["supportFreight"] = True
        dto["postPriceInCent"] = str(int(round(post_price_yuan * 100)))
        dto["templateId"] = "0"
    elif mode == "无需邮寄":
        dto["templateId"] = "0"
    else:
        raise ValueError(f"不支持的发货模式: {mode}")

    return dto


def build_publish_preview(
    *,
    title: str,
    description: str,
    price_yuan: float,
    original_price_yuan: float | None,
    shipping_mode: ShippingMode,
    post_price_yuan: float | None = None,
    can_self_pickup: bool = False,
    quantity: int = 1,
) -> dict[str, Any]:
    price_dto: dict[str, str] = {"priceInCent": str(int(round(price_yuan * 100)))}
    if original_price_yuan and original_price_yuan > 0:
        price_dto["origPriceInCent"] = str(int(round(original_price_yuan * 100)))

    return {
        "itemTypeStr": "b",
        "quantity": str(quantity),
        "simpleItem": "true",
        "itemTextDTO": {
            "title": title,
            "desc": description,
            "titleDescSeparate": True,
        },
        "itemPriceDTO": price_dto,
        "itemPostFeeDTO": build_item_post_fee_dto(
            shipping_mode,
            post_price_yuan=post_price_yuan,
            can_self_pickup=can_self_pickup,
        ),
        "publishScene": "pcMainPublish",
        "bizcode": "pcMainPublish",
        "sourceId": "pcMainPublish",
    }
