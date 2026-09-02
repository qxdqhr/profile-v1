"""Cookie 解析与持久化"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def parse_cookie_string(cookie_str: str) -> dict[str, str]:
    cookies: dict[str, str] = {}
    for part in cookie_str.split(";"):
        part = part.strip()
        if not part or "=" not in part:
            continue
        key, value = part.split("=", 1)
        cookies[key.strip()] = value.strip()
    return cookies


def cookies_to_string(cookies: dict[str, str]) -> str:
    return "; ".join(f"{k}={v}" for k, v in cookies.items())


def load_cookies(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and "cookie_string" in data:
        return parse_cookie_string(str(data["cookie_string"]))
    if isinstance(data, dict):
        return {str(k): str(v) for k, v in data.items()}
    raise ValueError(f"无法解析 Cookie 文件: {path}")


def save_cookies(path: Path, cookies: dict[str, str], extra: dict[str, Any] | None = None) -> None:
    payload: dict[str, Any] = {
        "cookie_string": cookies_to_string(cookies),
        "cookies": cookies,
    }
    if extra:
        payload.update(extra)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
