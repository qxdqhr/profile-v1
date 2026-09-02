"""小红书 Web x-s / x-t 签名封装"""

from __future__ import annotations

from typing import Any

from xhs.help import sign as _xhs_sign


def generate_sign_headers(
    uri: str,
    data: dict[str, Any] | None = None,
    *,
    a1: str = "",
    b1: str = "",
    ctime: int | None = None,
) -> dict[str, str]:
    """
    生成 edith.xiaohongshu.com 请求头签名。

    基于社区库 xhs 的 sign 实现，算法会随平台更新，需保持 xhs 版本跟进。
    """
    kwargs: dict[str, Any] = {"a1": a1, "b1": b1}
    if ctime is not None:
        kwargs["ctime"] = ctime
    return _xhs_sign(uri, data, **kwargs)
