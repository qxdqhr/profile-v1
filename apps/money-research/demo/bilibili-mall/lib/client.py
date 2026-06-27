"""B 站会员购 / 票务 HTTP 客户端"""

from __future__ import annotations

import json
import time
from typing import Any

import requests

from .cookies import cookies_to_string
from .link_parser import ParsedLink, parse_link

SHOW_BASE = "https://show.bilibili.com"
MALL_BASE = "https://mall.bilibili.com"
API_BASE = "https://api.bilibili.com"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class BilibiliMallClient:
    def __init__(self, cookies: dict[str, str] | None = None):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://www.bilibili.com/",
            }
        )
        if cookies:
            self.session.cookies.update(cookies)

    @property
    def cookies(self) -> dict[str, str]:
        return requests.utils.dict_from_cookiejar(self.session.cookies)

    def export_cookie_string(self) -> str:
        return cookies_to_string(self.cookies)

    def _json(self, response: requests.Response) -> dict[str, Any]:
        try:
            return response.json()
        except ValueError:
            return {"errno": -1, "msg": response.text[:500]}

    def check_login(self) -> dict[str, Any]:
        response = self.session.get(f"{API_BASE}/x/web-interface/nav", timeout=30)
        data = self._json(response)
        code = data.get("code", -1)
        if code != 0:
            return {"ok": False, "logged_in": False, "error": data.get("message", "未登录"), "raw": data}
        nav = data.get("data") or {}
        if not nav.get("isLogin"):
            return {"ok": False, "logged_in": False, "error": "Cookie 无效或未登录", "raw": data}
        return {
            "ok": True,
            "logged_in": True,
            "uname": nav.get("uname"),
            "mid": nav.get("mid"),
            "face": nav.get("face"),
            "vip_status": (nav.get("vipStatus") or nav.get("vip_status")),
            "raw": data,
        }

    def parse_link(self, url: str) -> dict[str, Any]:
        parsed = parse_link(url)
        return {"ok": parsed.link_type != "unknown", "parsed": parsed.__dict__}

    def get_project_info(self, project_id: int) -> dict[str, Any]:
        response = self.session.get(
            f"{SHOW_BASE}/api/ticket/project/getV2",
            params={
                "id": project_id,
                "project_id": project_id,
                "requestSource": "neul-next",
            },
            headers={"Referer": f"{SHOW_BASE}/platform/detail.html?id={project_id}"},
            timeout=30,
        )
        data = self._json(response)
        errno = data.get("errno", 0)
        if errno not in (0, None) and data.get("code", 0) not in (0, None):
            return {"ok": False, "error": data.get("msg") or data.get("message"), "raw": data}
        project = data.get("data") or data
        return {
            "ok": True,
            "project_id": project_id,
            "name": project.get("name") or project.get("project_name"),
            "place_name": project.get("place_name"),
            "screen_list": project.get("screen_list", []),
            "performance_desc": project.get("performance_desc"),
            "raw": data,
        }

    def list_sessions_summary(self, project_id: int) -> dict[str, Any]:
        info = self.get_project_info(project_id)
        if not info.get("ok"):
            return info
        sessions = []
        for screen in info.get("screen_list", []):
            tickets = []
            for ticket in screen.get("ticket_list", []):
                tickets.append(
                    {
                        "sku_id": ticket.get("id"),
                        "price_yuan": (ticket.get("price") or 0) / 100,
                        "desc": ticket.get("desc"),
                        "sale_start": ticket.get("sale_start"),
                        "sale_end": ticket.get("sale_end"),
                        "clickable": ticket.get("clickable"),
                    }
                )
            sessions.append(
                {
                    "screen_id": screen.get("id"),
                    "name": screen.get("name"),
                    "start_time": screen.get("start_time"),
                    "tickets": tickets,
                }
            )
        return {"ok": True, "project_id": project_id, "project_name": info.get("name"), "sessions": sessions}

    def list_buyers(self, project_id: int) -> dict[str, Any]:
        response = self.session.get(
            f"{SHOW_BASE}/api/ticket/buyer/list",
            params={"project_id": project_id, "src": "ticket"},
            headers={"Referer": f"{SHOW_BASE}/platform/detail.html?id={project_id}"},
            timeout=30,
        )
        data = self._json(response)
        buyers = (data.get("data") or {}).get("list") or data.get("data") or []
        return {"ok": True, "buyers": buyers, "raw": data}

    def list_addresses(self, project_id: int) -> dict[str, Any]:
        response = self.session.get(
            f"{SHOW_BASE}/api/ticket/addr/list",
            params={"project_id": project_id, "src": "ticket"},
            timeout=30,
        )
        data = self._json(response)
        return {"ok": True, "addresses": data.get("data") or data, "raw": data}

    def list_market_items(self, next_id: str | None = None) -> dict[str, Any]:
        payload = {
            "sortType": "TIME_DESC",
            "priceFilters": [],
            "discountFilters": [],
            "nextId": next_id,
        }
        response = self.session.post(
            f"{MALL_BASE}/mall-magic-c/internet/c2c/v2/list",
            json=payload,
            headers={
                "Referer": f"{MALL_BASE}/neul-next/index.html?page=magic-market_index",
                "Origin": MALL_BASE,
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        data = self._json(response)
        if data.get("errno") == -1 and isinstance(data.get("msg"), str) and data["msg"].startswith("<!"):
            return {
                "ok": False,
                "error": "市集接口需有效 Cookie 或触发风控，请登录 mall.bilibili.com 后重试",
                "items": [],
                "raw": {"hint": "HTTP 返回 HTML 而非 JSON"},
            }
        block = data.get("data") or {}
        items = block.get("data") or []
        return {
            "ok": bool(data.get("success", data.get("code") == 0)),
            "items": items[:20],
            "next_id": block.get("nextId"),
            "raw": data,
        }

    def get_market_item(self, c2c_items_id: int) -> dict[str, Any]:
        response = self.session.get(
            f"{MALL_BASE}/mall-magic-c/internet/c2c/items/queryC2cItemsDetail",
            params={"c2cItemsId": c2c_items_id},
            headers={"Referer": f"{MALL_BASE}/neul-next/index.html?page=magic-market_detail&itemsId={c2c_items_id}"},
            timeout=30,
        )
        data = self._json(response)
        return {"ok": bool(data.get("success", data.get("code") == 0)), "item": data.get("data"), "raw": data}

    def _auth_mode_from_project(self, project_info: dict[str, Any]) -> str:
        desc = project_info.get("performance_desc") or {}
        for block in desc.get("list", []):
            if block.get("module") != "base_info":
                continue
            for detail in block.get("details", []):
                content = str(detail.get("content", ""))
                if "一人一证" in content or "一单一证" in content:
                    return "id_card"
        return "contact"

    def prepare_order(
        self,
        *,
        project_id: int,
        screen_id: int,
        sku_id: int,
        pay_money_fen: int,
        count: int = 1,
        buyer_id: int | None = None,
    ) -> dict[str, Any]:
        project = self.get_project_info(project_id)
        if not project.get("ok"):
            return project

        buyers_res = self.list_buyers(project_id)
        buyers = buyers_res.get("buyers") or []
        if not buyers:
            return {"ok": False, "error": "无购票人信息，请先在 B 站票务页面添加", "raw": buyers_res}

        buyer = None
        if buyer_id is not None:
            buyer = next((b for b in buyers if b.get("id") == buyer_id), None)
        if buyer is None:
            buyer = next((b for b in buyers if b.get("is_default")), buyers[0])

        auth_mode = self._auth_mode_from_project({"performance_desc": project.get("performance_desc")})
        form: dict[str, Any] = {
            "count": count,
            "order_type": 1,
            "project_id": project_id,
            "screen_id": screen_id,
            "sku_id": sku_id,
            "pay_money": pay_money_fen,
            "timestamp": int(time.time() * 1000),
            "ticket_agent": "",
            "newRisk": True,
            "requestSource": "neul-next",
        }
        if auth_mode == "id_card":
            form["buyer_info"] = json.dumps([buyer], ensure_ascii=False)
        else:
            form["buyer"] = buyer.get("name", "")
            form["tel"] = buyer.get("tel", "")

        response = self.session.post(
            f"{SHOW_BASE}/api/ticket/order/prepare",
            params={"project_id": project_id},
            data=form,
            headers={
                "Referer": f"{SHOW_BASE}/platform/detail.html?id={project_id}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout=30,
        )
        data = self._json(response)
        token = (data.get("data") or {}).get("token")
        errno = data.get("errno", 0)
        ok = bool(token) and errno in (0, None)
        return {
            "ok": ok,
            "token": token,
            "auth_mode": auth_mode,
            "buyer": buyer,
            "error": None if ok else data.get("msg"),
            "raw": data,
        }

    def pipeline(
        self,
        *,
        url: str,
        screen_id: int | None = None,
        sku_id: int | None = None,
        dry_run: bool = True,
    ) -> dict[str, Any]:
        parsed: ParsedLink = parse_link(url)
        steps: dict[str, Any] = {"parsed": parsed.__dict__}

        if parsed.link_type == "mall_item" and parsed.c2c_items_id:
            item = self.get_market_item(parsed.c2c_items_id)
            steps["market_item"] = item
            return {"ok": item.get("ok", False), "dry_run": dry_run, "steps": steps}

        if parsed.link_type != "show_project" or not parsed.project_id:
            return {"ok": False, "error": "无法解析票务项目链接", "steps": steps}

        project_id = parsed.project_id
        inventory = self.list_sessions_summary(project_id)
        steps["inventory"] = inventory
        if not inventory.get("ok"):
            return {"ok": False, "steps": steps}

        chosen_screen = screen_id
        chosen_sku = sku_id
        price_fen = 0
        if chosen_screen is None or chosen_sku is None:
            for session in inventory.get("sessions", []):
                for ticket in session.get("tickets", []):
                    if ticket.get("sku_id"):
                        chosen_screen = session["screen_id"]
                        chosen_sku = ticket["sku_id"]
                        price_fen = int((ticket.get("price_yuan") or 0) * 100)
                        break
                if chosen_sku:
                    break

        if not chosen_screen or not chosen_sku:
            return {"ok": False, "error": "未找到可用票档", "steps": steps}

        steps["selection"] = {
            "screen_id": chosen_screen,
            "sku_id": chosen_sku,
            "pay_money_fen": price_fen,
        }

        if dry_run:
            steps["prepare"] = {"dry_run": True, "message": "跳过 prepare/create，仅预览选票"}
            return {"ok": True, "dry_run": True, "steps": steps}

        login = self.check_login()
        steps["login"] = login
        if not login.get("logged_in"):
            return {"ok": False, "steps": steps}

        prepare = self.prepare_order(
            project_id=project_id,
            screen_id=chosen_screen,
            sku_id=chosen_sku,
            pay_money_fen=price_fen or 1,
        )
        steps["prepare"] = prepare
        return {"ok": prepare.get("ok", False), "dry_run": False, "steps": steps}
