"""百度网盘 Web Cookie 客户端"""

from __future__ import annotations

import base64
import json
import re
import time
from typing import Any

import requests

from .cookies import cookies_to_string
from .share_parser import ParsedShareLink, extract_yun_data, parse_share_url

APP_ID = "250528"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class BaiduPanClient:
    def __init__(self, cookies: dict[str, str]):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Referer": "https://pan.baidu.com/",
                "Accept": "text/html,application/json,*/*",
                "Accept-Encoding": "gzip, deflate, br",
            }
        )
        self.session.cookies.update(cookies)
        self._bdstoken: str | None = None

    @property
    def cookies(self) -> dict[str, str]:
        return self.session.cookies.get_dict()

    def export_cookie_string(self) -> str:
        return cookies_to_string(self.cookies)

    def _ensure_baiduid(self) -> None:
        if self.session.cookies.get("BAIDUID"):
            return
        self.session.get("https://pan.baidu.com/", timeout=20)

    def _logid(self) -> str:
        baiduid = self.session.cookies.get("BAIDUID", "")
        encoded = base64.b64encode(baiduid.encode("utf-8")).decode("utf-8")
        return encoded

    def _common_params(self) -> dict[str, str | int]:
        return {
            "channel": "chunlei",
            "web": "1",
            "app_id": APP_ID,
            "clienttype": "0",
            "bdstoken": self.get_bdstoken(),
            "logid": self._logid(),
        }

    def get_bdstoken(self) -> str:
        if self._bdstoken:
            return self._bdstoken
        url = "https://pan.baidu.com/api/gettemplatevariable"
        params = {"fields": '["bdstoken","token"]', "clienttype": "0", "app_id": APP_ID}
        response = self.session.get(url, params=params, timeout=20)
        data = response.json()
        if data.get("errno") != 0:
            raise RuntimeError(f"获取 bdstoken 失败: {data}")
        self._bdstoken = data["result"]["bdstoken"]
        return self._bdstoken

    def check_login(self) -> dict[str, Any]:
        quota = self.session.get(
            "https://pan.baidu.com/api/quota",
            params={"checkfree": "1", "checkexpire": "1"},
            timeout=20,
        ).json()
        username = None
        try:
            home = self.session.get("https://pan.baidu.com/disk/home", timeout=20).text
            match = re.search(r'"username"\s*:\s*"([^"]+)"', home)
            if match:
                username = match.group(1)
        except Exception:  # noqa: BLE001
            pass
        ok = quota.get("errno") == 0 and bool(self.session.cookies.get("BDUSS"))
        return {
            "ok": ok,
            "username": username,
            "quota": quota,
            "bdstoken": self.get_bdstoken() if ok else None,
        }

    def parse_share_link(self, share_url: str) -> dict[str, Any]:
        parsed = parse_share_url(share_url)
        self._ensure_baiduid()
        page_url = f"https://pan.baidu.com/s/1{parsed.surl}"
        response = self.session.get(page_url, timeout=30)
        response.encoding = "utf-8"
        yun = extract_yun_data(response.text)
        file_list = yun.get("file_list") or []
        if isinstance(file_list, dict):
            file_list = file_list.get("list") or []
        return {
            "parsed": {
                "surl": parsed.surl,
                "share_url": page_url,
                "pwd_from_url": parsed.pwd,
            },
            "shareid": str(yun.get("shareid") or yun.get("share_id") or ""),
            "uk": str(yun.get("share_uk") or yun.get("uk") or ""),
            "bdstoken_share": yun.get("bdstoken"),
            "title": yun.get("title") or yun.get("server_filename"),
            "need_pass": bool(yun.get("pwd") or yun.get("hit_password")),
            "files": [
                {
                    "fs_id": str(item.get("fs_id")),
                    "server_filename": item.get("server_filename"),
                    "isdir": item.get("isdir"),
                    "size": item.get("size"),
                }
                for item in file_list
            ],
        }

    def verify_extract_code(self, surl: str, pwd: str) -> dict[str, Any]:
        url = "https://pan.baidu.com/share/verify"
        params = {"surl": surl, "t": str(int(time.time() * 1000))}
        response = self.session.post(url, params=params, data={"pwd": pwd, "vcode": "", "vcode_str": ""}, timeout=20)
        data = response.json()
        if data.get("errno") != 0:
            return {"ok": False, "errno": data.get("errno"), "response": data}
        return {
            "ok": True,
            "randsk": data.get("randsk"),
            "bdclnd": self.session.cookies.get("BDCLND"),
            "cookies": self.cookies,
        }

    def list_share_files(self, shareid: str, uk: str, sekey: str, surl: str) -> dict[str, Any]:
        url = "https://pan.baidu.com/share/list"
        params = {
            "shareid": shareid,
            "uk": uk,
            "root": "1",
            "sekey": sekey,
            "page": "1",
            "num": "100",
            "shorturl": surl,
        }
        response = self.session.get(url, params=params, timeout=30)
        data = response.json()
        if data.get("errno") != 0:
            return {"ok": False, "errno": data.get("errno"), "response": data}
        files = data.get("list") or []
        return {
            "ok": True,
            "share_id": str(data.get("share_id") or shareid),
            "uk": str(data.get("uk") or uk),
            "files": files,
            "fs_ids": [str(item["fs_id"]) for item in files],
        }

    def ensure_folder(self, path: str) -> dict[str, Any]:
        if path in ("", "/"):
            return {"ok": True, "path": "/"}
        url = "https://pan.baidu.com/api/create"
        params = {"a": "commit", "channel": "chunlei", "web": "1", "app_id": APP_ID, "clienttype": "0"}
        data = {
            "path": path if path.startswith("/") else f"/{path}",
            "isdir": "1",
            "block_list": "[]",
        }
        response = self.session.post(url, params=params, data=data, timeout=20)
        result = response.json()
        return {"ok": result.get("errno") in (0, -8), "path": path, "response": result}

    def transfer_save(
        self,
        *,
        shareid: str,
        uk: str,
        sekey: str,
        fs_ids: list[str],
        save_path: str,
        referer: str,
    ) -> dict[str, Any]:
        url = "https://pan.baidu.com/share/transfer"
        params = {
            **self._common_params(),
            "shareid": shareid,
            "from": uk,
            "sekey": sekey,
            "ondup": "newcopy",
            "async": "1",
        }
        data = {
            "fsidlist": json.dumps([int(x) for x in fs_ids]),
            "path": save_path if save_path.startswith("/") else f"/{save_path}",
        }
        headers = {"Referer": referer}
        response = self.session.post(url, params=params, data=data, headers=headers, timeout=60)
        result = response.json()
        ok = result.get("errno") == 0
        return {
            "ok": ok,
            "errno": result.get("errno"),
            "extra": result.get("extra"),
            "info": result.get("info"),
            "response": result,
        }

    def search_file(self, keyword: str) -> list[dict[str, Any]]:
        url = "https://pan.baidu.com/api/search"
        params = {"key": keyword, "web": "1", "app_id": APP_ID}
        response = self.session.get(url, params=params, timeout=30)
        data = response.json()
        if data.get("errno") != 0:
            return []
        return data.get("list") or []

    def create_share(
        self,
        fs_ids: list[str],
        *,
        pwd: str = "",
        period: int = 7,
    ) -> dict[str, Any]:
        url = "https://pan.baidu.com/share/set"
        params = {
            "channel": "chunlei",
            "clienttype": "0",
            "web": "1",
            "app_id": APP_ID,
            "bdstoken": self.get_bdstoken(),
        }
        data = {
            "schannel": "4",
            "channel_list": "[]",
            "period": str(period),
            "pwd": pwd,
            "fid_list": json.dumps([int(x) for x in fs_ids]),
        }
        response = self.session.post(url, params=params, data=data, timeout=30)
        result = response.json()
        ok = result.get("errno") == 0
        link = None
        if ok:
            link = f"https://pan.baidu.com/s/1{result.get('shorturl')}"
            if pwd:
                link = f"{link}?pwd={pwd}"
        return {
            "ok": ok,
            "errno": result.get("errno"),
            "share_id": result.get("shareid"),
            "shorturl": result.get("shorturl"),
            "link": link,
            "pwd": pwd or None,
            "response": result,
        }

    def run_pipeline(
        self,
        share_url: str,
        *,
        pwd: str | None = None,
        save_path: str = "/转存调研",
        share_pwd: str = "x1y2",
        share_period: int = 7,
    ) -> dict[str, Any]:
        parsed: ParsedShareLink = parse_share_url(share_url)
        meta = self.parse_share_link(share_url)
        sekey = ""
        pwd = pwd or parsed.pwd

        if meta.get("need_pass") or pwd:
            if not pwd:
                return {"ok": False, "step": "verify", "error": "分享需要提取码但未提供"}
            verify = self.verify_extract_code(parsed.surl, pwd)
            if not verify.get("ok"):
                return {"ok": False, "step": "verify", "result": verify}
            sekey = verify["randsk"]

        shareid = meta["shareid"]
        uk = meta["uk"]
        referer = f"https://pan.baidu.com/s/1{parsed.surl}"

        if sekey:
            listing = self.list_share_files(shareid, uk, sekey, parsed.surl)
            if not listing.get("ok"):
                return {"ok": False, "step": "list_share", "result": listing}
            fs_ids = listing["fs_ids"]
            shareid = listing["share_id"]
            uk = listing["uk"]
        else:
            fs_ids = [f["fs_id"] for f in meta.get("files", [])]

        if not fs_ids:
            return {"ok": False, "step": "parse", "error": "未找到可转存文件 fs_id"}

        folder = self.ensure_folder(save_path)
        transfer = self.transfer_save(
            shareid=shareid,
            uk=uk,
            sekey=sekey,
            fs_ids=fs_ids,
            save_path=save_path,
            referer=referer,
        )
        if not transfer.get("ok"):
            return {"ok": False, "step": "transfer", "result": transfer}

        saved_fs_ids = fs_ids
        extra_list = (transfer.get("extra") or {}).get("list") or []
        if extra_list:
            saved_fs_ids = [str(item.get("to_fs_id") or item.get("fs_id")) for item in extra_list if item.get("to_fs_id") or item.get("fs_id")]

        new_share = self.create_share(saved_fs_ids, pwd=share_pwd, period=share_period)
        return {
            "ok": new_share.get("ok", False),
            "steps": {
                "parse": meta,
                "folder": folder,
                "transfer": transfer,
                "create_share": new_share,
            },
            "saved_path": save_path,
            "new_share_link": new_share.get("link"),
            "new_share_pwd": new_share.get("pwd"),
        }
