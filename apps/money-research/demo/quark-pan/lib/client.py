"""夸克网盘 Web Cookie 客户端"""

from __future__ import annotations

import random
import time
from typing import Any

import requests

from .cookies import cookies_to_string
from .share_parser import ParsedShareLink, parse_share_url

BASE_URL = "https://drive-pc.quark.cn"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class QuarkPanClient:
    def __init__(self, cookies: dict[str, str]):
        self.session = requests.Session()
        self._cookie_header = cookies_to_string(cookies)
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Referer": "https://pan.quark.cn/",
                "Origin": "https://pan.quark.cn",
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "cookie": self._cookie_header,
            }
        )

    @property
    def cookies(self) -> dict[str, str]:
        return {k: v for part in self._cookie_header.split(";") if "=" in part for k, v in [part.strip().split("=", 1)]}

    def export_cookie_string(self) -> str:
        return self._cookie_header

    def _params(self, **extra: str | int) -> dict[str, str | int]:
        params: dict[str, str | int] = {
            "pr": "ucpro",
            "fr": "pc",
            "uc_param_str": "",
        }
        params.update(extra)
        return params

    def _request(self, method: str, url: str, **kwargs: Any) -> dict[str, Any]:
        response = self.session.request(method, url, timeout=60, **kwargs)
        try:
            return response.json()
        except ValueError:
            return {"code": -1, "message": response.text[:500]}

    def check_login(self) -> dict[str, Any]:
        data = self._request(
            "GET",
            "https://pan.quark.cn/account/info",
            params={"fr": "pc", "platform": "pc"},
        )
        ok = bool(data.get("data"))
        account = data.get("data") or {}
        return {
            "ok": ok,
            "nickname": account.get("nickname"),
            "mobile": account.get("mobile"),
            "account": account,
        }

    def parse_share_link(self, share_url: str) -> dict[str, Any]:
        parsed = parse_share_url(share_url)
        return {
            "parsed": {
                "pwd_id": parsed.pwd_id,
                "passcode_from_url": parsed.passcode,
                "pdir_fid": parsed.pdir_fid,
                "share_url": share_url,
            }
        }

    def verify_passcode(self, pwd_id: str, passcode: str) -> dict[str, Any]:
        data = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/share/sharepage/token",
            params=self._params(),
            json={"pwd_id": pwd_id, "passcode": passcode},
        )
        if data.get("status") == 200 and data.get("data", {}).get("stoken"):
            return {
                "ok": True,
                "stoken": data["data"]["stoken"],
                "response": data,
            }
        return {
            "ok": False,
            "message": data.get("message") or data.get("status"),
            "response": data,
        }

    def list_share_files(self, pwd_id: str, stoken: str, pdir_fid: str = "0") -> dict[str, Any]:
        files: list[dict[str, Any]] = []
        page = 1
        total = None
        while True:
            result = self._request(
                "GET",
                f"{BASE_URL}/1/clouddrive/share/sharepage/detail",
                params=self._params(
                    pwd_id=pwd_id,
                    stoken=stoken,
                    pdir_fid=pdir_fid,
                    force="0",
                    _page=page,
                    _size="50",
                    _fetch_banner="0",
                    _fetch_share="0",
                    _fetch_total="1",
                    _sort="file_type:asc,updated_at:desc",
                ),
            )
            if result.get("code") != 0:
                return {"ok": False, "errno": result.get("code"), "response": result}
            chunk = result.get("data", {}).get("list") or []
            files.extend(chunk)
            total = result.get("metadata", {}).get("_total", len(files))
            if not chunk or len(files) >= int(total):
                break
            page += 1

        return {
            "ok": True,
            "files": [
                {
                    "fid": item.get("fid"),
                    "file_name": item.get("file_name"),
                    "share_fid_token": item.get("share_fid_token"),
                    "file_type": item.get("file_type"),
                    "size": item.get("size"),
                }
                for item in files
            ],
            "fid_list": [str(item["fid"]) for item in files],
            "fid_token_list": [str(item["share_fid_token"]) for item in files],
        }

    def resolve_folder_fid(self, dir_path: str) -> dict[str, Any]:
        normalized = dir_path if dir_path.startswith("/") else f"/{dir_path}"
        if normalized in ("/", ""):
            return {"ok": True, "fid": "0", "path": "/"}

        result = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/file/info/path_list",
            params=self._params(),
            json={"file_path": [normalized], "namespace": "0"},
        )
        if result.get("code") == 0 and result.get("data"):
            fid = result["data"][0]["fid"]
            return {"ok": True, "fid": str(fid), "path": normalized, "created": False}

        mkdir = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/file",
            params=self._params(),
            json={
                "pdir_fid": "0",
                "file_name": "",
                "dir_path": normalized,
                "dir_init_lock": False,
            },
        )
        if mkdir.get("code") == 0:
            fid = mkdir["data"]["fid"]
            return {"ok": True, "fid": str(fid), "path": normalized, "created": True}
        return {"ok": False, "path": normalized, "response": mkdir}

    def transfer_save(
        self,
        *,
        pwd_id: str,
        stoken: str,
        fid_list: list[str],
        fid_token_list: list[str],
        to_pdir_fid: str,
        pdir_fid: str = "0",
    ) -> dict[str, Any]:
        result = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/share/sharepage/save",
            params=self._params(
                app="clouddrive",
                __dt=int(random.uniform(1, 5) * 60 * 1000),
                __t=int(time.time() * 1000),
            ),
            json={
                "fid_list": fid_list,
                "fid_token_list": fid_token_list,
                "to_pdir_fid": to_pdir_fid,
                "pwd_id": pwd_id,
                "stoken": stoken,
                "pdir_fid": pdir_fid,
                "scene": "link",
            },
        )
        if result.get("code") != 0:
            return {"ok": False, "response": result}

        task_sync = result.get("data", {}).get("task_sync")
        if task_sync:
            task_resp = result.get("data", {}).get("task_resp", {})
            ok = task_resp.get("code") == 0
            return {
                "ok": ok,
                "sync": True,
                "task_data": task_resp.get("data", {}),
                "response": result,
            }

        task_id = result.get("data", {}).get("task_id")
        if not task_id:
            return {"ok": False, "error": "未返回 task_id", "response": result}

        task_data = self.poll_task(task_id)
        ok = bool(task_data and task_data.get("status") == 2)
        return {
            "ok": ok,
            "sync": False,
            "task_id": task_id,
            "task_data": task_data,
            "response": result,
        }

    def poll_task(self, task_id: str, max_retries: int = 30) -> dict[str, Any] | None:
        for retry in range(max_retries):
            result = self._request(
                "GET",
                f"{BASE_URL}/1/clouddrive/task",
                params=self._params(
                    task_id=task_id,
                    retry_index=retry,
                    __dt=int(random.uniform(1, 5) * 60 * 1000),
                    __t=int(time.time() * 1000),
                ),
            )
            if result.get("code") != 0:
                return None
            task_data = result.get("data") or {}
            status = task_data.get("status")
            if status == 2:
                return task_data
            if status == 3:
                return task_data
            time.sleep(0.5)
        return None

    def list_dir(self, pdir_fid: str = "0") -> list[dict[str, Any]]:
        result = self._request(
            "GET",
            f"{BASE_URL}/1/clouddrive/file/sort",
            params=self._params(
                pdir_fid=pdir_fid,
                _page=1,
                _size=100,
                _fetch_total="1",
                _fetch_sub_dirs="0",
                _sort="file_type:asc,updated_at:desc",
            ),
        )
        if result.get("code") != 0:
            return []
        return result.get("data", {}).get("list") or []

    def create_share(
        self,
        fid_list: list[str],
        *,
        title: str = "分享",
        passcode: str = "",
        expire_days: int = 7,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "fid_list": fid_list,
            "title": title,
            "url_type": 2 if passcode else 1,
            "expired_type": 2 if expire_days > 0 else 1,
        }
        if passcode:
            body["passcode"] = passcode
        if expire_days > 0:
            body["expire_time"] = expire_days * 86400

        result = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/share",
            params=self._params(),
            json=body,
        )
        if result.get("code") != 0:
            return {"ok": False, "response": result}

        share_id = None
        if result.get("data", {}).get("task_sync"):
            task_resp = result.get("data", {}).get("task_resp", {})
            if task_resp.get("code") == 0:
                share_id = task_resp.get("data", {}).get("share_id")
        else:
            task_id = result.get("data", {}).get("task_id")
            if task_id:
                task_data = self.poll_task(task_id)
                if task_data and task_data.get("status") == 2:
                    share_id = task_data.get("share_id")

        if not share_id:
            return {"ok": False, "error": "未获取 share_id", "response": result}

        share_detail = self._request(
            "POST",
            f"{BASE_URL}/1/clouddrive/share/password",
            params=self._params(),
            json={"share_id": share_id},
        )
        if share_detail.get("code") != 0:
            return {"ok": False, "share_id": share_id, "response": share_detail}

        detail = share_detail.get("data") or {}
        link = detail.get("share_url")
        pwd = detail.get("passcode") or passcode
        if link and pwd and "pwd=" not in link:
            link = f"{link}?pwd={pwd}"

        return {
            "ok": True,
            "share_id": share_id,
            "link": link,
            "pwd": pwd,
            "title": detail.get("title"),
            "response": share_detail,
        }

    def run_pipeline(
        self,
        share_url: str,
        *,
        passcode: str | None = None,
        save_path: str = "/转存调研",
        share_passcode: str = "x1y2",
        expire_days: int = 7,
    ) -> dict[str, Any]:
        parsed: ParsedShareLink = parse_share_url(share_url)
        code = passcode if passcode is not None else parsed.passcode

        verify = self.verify_passcode(parsed.pwd_id, code)
        if not verify.get("ok"):
            return {"ok": False, "step": "verify", "result": verify}
        stoken = verify["stoken"]

        listing = self.list_share_files(parsed.pwd_id, stoken, parsed.pdir_fid)
        if not listing.get("ok") or not listing.get("fid_list"):
            return {"ok": False, "step": "list", "result": listing}

        folder = self.resolve_folder_fid(save_path)
        if not folder.get("ok"):
            return {"ok": False, "step": "folder", "result": folder}

        transfer = self.transfer_save(
            pwd_id=parsed.pwd_id,
            stoken=stoken,
            fid_list=listing["fid_list"],
            fid_token_list=listing["fid_token_list"],
            to_pdir_fid=folder["fid"],
            pdir_fid=parsed.pdir_fid,
        )
        if not transfer.get("ok"):
            return {"ok": False, "step": "transfer", "result": transfer}

        saved_fids = listing["fid_list"]
        task_data = transfer.get("task_data") or {}
        if task_data.get("save_as", {}).get("save_as_top_fids"):
            saved_fids = [str(x) for x in task_data["save_as"]["save_as_top_fids"]]
        else:
            names = {f["file_name"] for f in listing["files"]}
            dir_files = self.list_dir(folder["fid"])
            matched = [str(item["fid"]) for item in dir_files if item.get("file_name") in names]
            if matched:
                saved_fids = matched

        new_share = self.create_share(
            saved_fids,
            title="转存分享",
            passcode=share_passcode,
            expire_days=expire_days,
        )
        return {
            "ok": new_share.get("ok", False),
            "steps": {
                "parse": self.parse_share_link(share_url),
                "verify": verify,
                "list": listing,
                "folder": folder,
                "transfer": transfer,
                "create_share": new_share,
            },
            "saved_path": save_path,
            "new_share_link": new_share.get("link"),
            "new_share_pwd": new_share.get("pwd"),
        }
