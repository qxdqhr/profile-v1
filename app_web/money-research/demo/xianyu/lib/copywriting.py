"""商品描述文案生成"""

from __future__ import annotations

from typing import Any


def build_listing_copy(
    *,
    product_name: str,
    condition: str = "95新",
    highlights: list[str] | None = None,
    defects: list[str] | None = None,
    price_yuan: float | None = None,
    original_price_yuan: float | None = None,
    reason: str = "闲置转让",
    extra_notes: str = "",
) -> dict[str, Any]:
    highlights = highlights or ["功能正常", "配件齐全", "支持验货"]
    defects = defects or []

    title = _build_title(product_name, condition)
    description = _build_description(
        product_name=product_name,
        condition=condition,
        highlights=highlights,
        defects=defects,
        price_yuan=price_yuan,
        original_price_yuan=original_price_yuan,
        reason=reason,
        extra_notes=extra_notes,
    )

    return {
        "title": title,
        "description": description,
        "title_length": len(title),
        "description_length": len(description),
        "sections": {
            "highlights": highlights,
            "defects": defects,
            "reason": reason,
        },
    }


def _build_title(product_name: str, condition: str) -> str:
    base = f"{condition} {product_name.strip()}"
    if len(base) <= 30:
        return base
    # 闲鱼标题建议 <= 30 字
    trimmed = product_name.strip()
    suffix = f" {condition}"
    max_name_len = 30 - len(suffix)
    if max_name_len < 4:
        return trimmed[:30]
    return f"{trimmed[:max_name_len]}{suffix}"


def _build_description(
    *,
    product_name: str,
    condition: str,
    highlights: list[str],
    defects: list[str],
    price_yuan: float | None,
    original_price_yuan: float | None,
    reason: str,
    extra_notes: str,
) -> str:
    lines = [
        f"【商品】{product_name}",
        f"【成色】{condition}",
        f"【转手原因】{reason}",
        "",
        "【商品亮点】",
    ]
    lines.extend(f"· {item}" for item in highlights)

    if defects:
        lines.extend(["", "【瑕疵说明】"])
        lines.extend(f"· {item}" for item in defects)

    if price_yuan is not None:
        lines.extend(["", f"【售价】¥{price_yuan:.2f}"])
    if original_price_yuan is not None and original_price_yuan > 0:
        lines.append(f"【原价参考】¥{original_price_yuan:.2f}")

    lines.extend(
        [
            "",
            "【发货说明】",
            "· 非质量问题不退不换，下单前请确认",
            "· 会尽量在 48 小时内发货",
            "· 偏远地区邮费需补差可私聊",
        ]
    )

    if extra_notes.strip():
        lines.extend(["", "【补充说明】", extra_notes.strip()])

    lines.extend(["", "感兴趣的朋友欢迎私聊～"])
    return "\n".join(lines)
