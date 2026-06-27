"""分享链接解析"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import parse_qs, urlparse


@dataclass
class ParsedShareLink:
    raw_url: str
    surl: str
    share_url: str
    pwd: str | None


SHARE_URL_RE = re.compile(
    r"https?://(?:pan|yun)\.baidu\.com/(?:s/1|share/link\?)[^\s]+",
    re.IGNORECASE,
)
SURL_RE = re.compile(r"/s/1([A-Za-z0-9_-]+)")


def parse_share_url(raw: str) -> ParsedShareLink:
    text = raw.strip()
    match = SHARE_URL_RE.search(text)
    if not match:
        raise ValueError(f"无法识别百度网盘分享链接: {raw}")

    share_url = match.group(0)
    parsed = urlparse(share_url)
    query = parse_qs(parsed.query)

    surl_match = SURL_RE.search(parsed.path)
    if not surl_match:
        raise ValueError(f"无法提取 surl: {share_url}")

    surl = surl_match.group(1)
    pwd = query.get("pwd", [None])[0]
    if pwd:
        pwd = pwd.strip()

    return ParsedShareLink(
        raw_url=text,
        surl=surl,
        share_url=share_url.split("?")[0] if "/s/1" in share_url else share_url,
        pwd=pwd,
    )


def extract_yun_data(html: str) -> dict[str, Any]:
    patterns = [
        r"yunData\s*=\s*(\{.*?\});",
        r"window\.yunData\s*=\s*(\{.*?\});",
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL)
        if match:
            import json

            raw = match.group(1)
            raw = raw.replace("undefined", "null")
            return json.loads(raw)
    raise ValueError("分享页未找到 yunData，可能需要登录或链接已失效")
