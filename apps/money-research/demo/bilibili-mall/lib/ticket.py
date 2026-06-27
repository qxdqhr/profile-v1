"""bili_ticket 生成（GenWebTicket）"""

from __future__ import annotations

import hashlib
import hmac
import time
from typing import Any

import requests

TICKET_URL = "https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket"
TICKET_KEY = b"XgwSnGZ1p"


def generate_bili_ticket(csrf: str = "") -> dict[str, Any]:
    ts = int(time.time())
    hexsign = hmac.new(TICKET_KEY, f"ts{ts}".encode(), hashlib.sha256).hexdigest()
    params = {
        "key_id": "ec02",
        "hexsign": hexsign,
        "context[ts]": ts,
        "csrf": csrf or "",
    }
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        ),
        "Referer": "https://www.bilibili.com/",
    }
    response = requests.post(TICKET_URL, params=params, headers=headers, timeout=30)
    try:
        payload = response.json()
    except ValueError:
        return {"ok": False, "error": response.text[:300]}
    ticket = (payload.get("data") or {}).get("ticket")
    return {
        "ok": bool(ticket),
        "ticket": ticket,
        "ttl": (payload.get("data") or {}).get("ttl"),
        "created_at": (payload.get("data") or {}).get("created_at"),
        "raw": payload,
    }
