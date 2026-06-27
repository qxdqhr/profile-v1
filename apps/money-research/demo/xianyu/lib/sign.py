"""闲鱼 Web H5 Mtop MD5 签名"""

from __future__ import annotations

import hashlib
import re

APP_KEY = "34839810"


def generate_sign(t: str, token: str, data: str, app_key: str = APP_KEY) -> str:
    """与闲鱼 PC Web 端一致的签名：MD5(token&t&appKey&data)"""
    raw = f"{token}&{t}&{app_key}&{data}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


def generate_device_id(user_id: str) -> str:
    """根据 unb 生成 deviceId（与常见 Web 端逻辑兼容的确定性 ID）"""
    digest = hashlib.md5(str(user_id).encode("utf-8")).hexdigest().upper()
    return (
        f"{digest[0:8]}-{digest[8:12]}-{digest[12:16]}-"
        f"{digest[16:20]}-{digest[20:32]}-{user_id}"
    )


def extract_token_from_cookie(cookie_value: str) -> str:
    """从 _m_h5_tk 取值，取下划线前半段作为签名 token"""
    if not cookie_value:
        raise ValueError("Cookie 中缺少 _m_h5_tk，请先执行登录刷新")
    return cookie_value.split("_", 1)[0]


def is_token_expired_response(payload: dict) -> bool:
    ret = payload.get("ret") or []
    if not ret:
        return False
    first = str(ret[0])
    return "令牌过期" in first or "FAIL_SYS_TOKEN" in first
