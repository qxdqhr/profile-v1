"""闲鱼 Web Mtop HTTP 客户端"""

from __future__ import annotations

import json
import time
from typing import Any

import requests

from .cookies import cookies_to_string
from .sign import APP_KEY, extract_token_from_cookie, generate_device_id, generate_sign, is_token_expired_response

DEFAULT_HEADERS = {
    "accept": "application/json",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "origin": "https://www.goofish.com",
    "referer": "https://www.goofish.com/",
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
}

MTOP_BASE = "https://h5api.m.goofish.com/h5"
UPLOAD_URL = "https://stream-upload.goofish.com/api/upload.api"
HAS_LOGIN_URL = "https://passport.goofish.com/newlogin/hasLogin.do"


class XianyuMtopClient:
    def __init__(self, cookies: dict[str, str]):
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self.session.cookies.update(cookies)
        self.device_id = generate_device_id(cookies.get("unb", "0"))

    @property
    def cookies(self) -> dict[str, str]:
        return self.session.cookies.get_dict()

    def _merge_response_cookies(self, response: requests.Response) -> None:
        for key, value in response.cookies.get_dict().items():
            self.session.cookies.set(key, value)

    def _token(self) -> str:
        return extract_token_from_cookie(self.session.cookies.get("_m_h5_tk", ""))

    def mtop_post(
        self,
        api: str,
        version: str,
        data_obj: dict[str, Any] | list[Any] | str,
        *,
        retry_on_token_expire: bool = True,
    ) -> dict[str, Any]:
        if isinstance(data_obj, str):
            data_val = data_obj
        else:
            data_val = json.dumps(data_obj, ensure_ascii=False, separators=(",", ":"))

        t = str(int(time.time() * 1000))
        params = {
            "jsv": "2.7.2",
            "appKey": APP_KEY,
            "t": t,
            "sign": generate_sign(t, self._token(), data_val),
            "v": version,
            "type": "originaljson",
            "accountSite": "xianyu",
            "dataType": "json",
            "timeout": "20000",
            "api": api,
            "sessionOption": "AutoLoginOnly",
        }
        url = f"{MTOP_BASE}/{api}/{version}/"
        response = self.session.post(url, params=params, data={"data": data_val}, timeout=30)
        self._merge_response_cookies(response)
        payload = response.json()
        if retry_on_token_expire and is_token_expired_response(payload):
            self.refresh_token()
            return self.mtop_post(api, version, data_obj, retry_on_token_expire=False)
        return payload

    def refresh_token(self) -> dict[str, Any]:
        data_val = json.dumps(
            {
                "appKey": "444e9908a51d1cb236a27862abc769c9",
                "deviceId": self.device_id,
            },
            separators=(",", ":"),
        )
        t = str(int(time.time() * 1000))
        params = {
            "jsv": "2.7.2",
            "appKey": APP_KEY,
            "t": t,
            "sign": "",
            "v": "1.0",
            "type": "originaljson",
            "accountSite": "xianyu",
            "dataType": "json",
            "timeout": "20000",
            "api": "mtop.taobao.idlemessage.pc.login.token",
            "sessionOption": "AutoLoginOnly",
        }
        token = self._token() if self.session.cookies.get("_m_h5_tk") else ""
        if token:
            params["sign"] = generate_sign(t, token, data_val)
        url = f"{MTOP_BASE}/mtop.taobao.idlemessage.pc.login.token/1.0/"
        response = self.session.post(url, params=params, data={"data": data_val}, timeout=30)
        self._merge_response_cookies(response)
        return response.json()

    def check_login(self) -> dict[str, Any]:
        response = self.session.get(
            HAS_LOGIN_URL,
            params={"appName": "xianyu", "fromSite": "77"},
            timeout=20,
        )
        self._merge_response_cookies(response)
        try:
            return response.json()
        except ValueError:
            return {"raw": response.text, "status_code": response.status_code}

    def get_login_user(self) -> dict[str, Any]:
        return self.mtop_post("mtop.taobao.idlemessage.pc.loginuser.get", "1.0", {})

    def upload_image(self, image_path: str) -> dict[str, Any]:
        with open(image_path, "rb") as file:
            response = self.session.post(
                UPLOAD_URL,
                params={"floderId": "0", "appkey": "xy_chat", "_input_charset": "utf-8"},
                files={"file": (image_path.split("/")[-1], file, "image/jpeg")},
                timeout=60,
            )
        self._merge_response_cookies(response)
        return response.json()

    def recommend_category(self, title: str, description: str, image_infos: list[dict[str, Any]]) -> dict[str, Any]:
        body = {
            "title": title,
            "lockCpv": False,
            "multiSKU": False,
            "publishScene": "mainPublish",
            "scene": "newPublishChoice",
            "description": description,
            "imageInfos": image_infos,
            "uniqueCode": str(int(time.time() * 1000)),
        }
        return self.mtop_post("mtop.taobao.idle.kgraph.property.recommend", "2.0", body)

    def get_default_location(self, longitude: float, latitude: float) -> dict[str, Any]:
        return self.mtop_post(
            "mtop.taobao.idle.local.poi.get",
            "1.0",
            {"longitude": longitude, "latitude": latitude},
        )

    def publish_item(self, publish_body: dict[str, Any]) -> dict[str, Any]:
        return self.mtop_post("mtop.idle.pc.idleitem.publish", "1.0", publish_body)

    def export_cookie_string(self) -> str:
        return cookies_to_string(self.cookies)
