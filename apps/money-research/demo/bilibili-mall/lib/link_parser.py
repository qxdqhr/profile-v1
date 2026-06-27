"""会员购 / 票务链接解析"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal
from urllib.parse import parse_qs, urlparse


LinkType = Literal["show_project", "mall_item", "unknown"]


@dataclass
class ParsedLink:
    raw_url: str
    link_type: LinkType
    project_id: int | None = None
    c2c_items_id: int | None = None


def parse_link(url: str) -> ParsedLink:
    parsed = urlparse(url.strip())
    query = parse_qs(parsed.query)

    if "show.bilibili.com" in parsed.netloc:
        for key in ("id", "project_id"):
            if key in query and query[key][0].isdigit():
                return ParsedLink(
                    raw_url=url,
                    link_type="show_project",
                    project_id=int(query[key][0]),
                )
        match = re.search(r"/detail/(\d+)", parsed.path)
        if match:
            return ParsedLink(raw_url=url, link_type="show_project", project_id=int(match.group(1)))

    if "mall.bilibili.com" in parsed.netloc:
        for key in ("itemsId", "c2cItemsId"):
            if key in query and query[key][0].isdigit():
                return ParsedLink(
                    raw_url=url,
                    link_type="mall_item",
                    c2c_items_id=int(query[key][0]),
                )

    if url.strip().isdigit():
        return ParsedLink(raw_url=url, link_type="show_project", project_id=int(url.strip()))

    return ParsedLink(raw_url=url, link_type="unknown")
