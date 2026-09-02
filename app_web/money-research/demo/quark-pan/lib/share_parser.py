"""夸克网盘分享链接解析"""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse


@dataclass
class ParsedShareLink:
    raw_url: str
    pwd_id: str
    passcode: str
    pdir_fid: str


SHARE_URL_RE = re.compile(r"https?://pan\.quark\.cn/s/\w+", re.IGNORECASE)


def parse_share_url(raw: str) -> ParsedShareLink:
    text = raw.strip()
    match = SHARE_URL_RE.search(text)
    if not match:
        raise ValueError(f"无法识别夸克分享链接: {raw}")

    share_url = match.group(0)
    parsed = urlparse(share_url)
    pwd_match = re.search(r"/s/([\w-]+)", parsed.path)
    if not pwd_match:
        raise ValueError(f"无法提取 pwd_id: {share_url}")

    pwd_id = pwd_match.group(1).split("-")[0]
    query = parse_qs(parsed.query)
    passcode = (query.get("pwd", [""])[0] or "").strip()

    # 支持文本里 pwd= 形式
    if not passcode:
        pwd_in_text = re.search(r"pwd=([\w]+)", text, re.I)
        if pwd_in_text:
            passcode = pwd_in_text.group(1)

    pdir_fid = "0"
    path_matches = re.findall(r"/([\w]{32})-?([^/\s?]+)?", share_url)
    if path_matches:
        pdir_fid = path_matches[-1][0]

    return ParsedShareLink(
        raw_url=text,
        pwd_id=pwd_id,
        passcode=passcode,
        pdir_fid=pdir_fid,
    )
