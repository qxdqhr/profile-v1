"""小红书 HTTP 客户端（封装 xhs.XhsClient）"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from xhs import XhsClient
from xhs.exception import DataFetchError, NeedVerifyError, SignError

from .cookies import cookies_to_string
from .sign import generate_sign_headers


class XiaohongshuClient:
    def __init__(self, cookies: dict[str, str]):
        cookie_str = cookies_to_string(cookies)
        self._raw_cookies = cookies
        self._client = XhsClient(cookie=cookie_str)

    @property
    def cookies(self) -> dict[str, str]:
        from xhs.help import cookie_str_to_cookie_dict

        return cookie_str_to_cookie_dict(self._client.cookie)

    def export_cookie_string(self) -> str:
        return self._client.cookie

    def check_login(self) -> dict[str, Any]:
        try:
            payload = self._client.get_self_info2()
        except (DataFetchError, SignError) as exc:
            return {"ok": False, "error": str(exc), "logged_in": False}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": str(exc), "logged_in": False}

        data = payload.get("data") if isinstance(payload, dict) else None
        if not data:
            return {
                "ok": False,
                "logged_in": False,
                "error": "登录态无效或响应为空",
                "raw": payload,
            }

        basic = data.get("basic_info") or {}
        return {
            "ok": True,
            "logged_in": True,
            "user_id": data.get("user_id") or basic.get("user_id"),
            "nickname": basic.get("nickname") or data.get("nickname"),
            "red_id": basic.get("red_id"),
            "images": basic.get("images"),
            "raw": payload,
        }

    def upload_image(self, image_path: str | Path) -> dict[str, Any]:
        path = Path(image_path)
        if not path.is_file():
            return {"ok": False, "error": f"图片不存在: {path}"}

        width, height = _guess_image_size(path)
        try:
            file_id, token = self._client.get_upload_files_permit("image", count=1)
            self._client.upload_file(file_id, token, str(path))
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": str(exc)}

        return {
            "ok": True,
            "file_id": file_id,
            "width": width,
            "height": height,
            "path": str(path),
        }

    def publish_image_note(
        self,
        *,
        title: str,
        desc: str,
        image_paths: list[str | Path],
        topics: list[str] | None = None,
        is_private: bool = False,
        dry_run: bool = False,
    ) -> dict[str, Any]:
        paths = [str(Path(p)) for p in image_paths]
        for p in paths:
            if not os.path.isfile(p):
                return {"ok": False, "error": f"图片不存在: {p}"}

        title = title[:20]
        preview = {
            "title": title,
            "desc": desc,
            "images": paths,
            "topics": topics or [],
            "is_private": is_private,
        }
        if dry_run:
            return {"ok": True, "dry_run": True, "preview": preview}

        topic_payload: list[dict[str, Any]] = []
        for topic in topics or []:
            try:
                suggested = self._client.get_suggest_topic(topic)
                if suggested:
                    topic_payload.append(suggested[0])
            except Exception:  # noqa: BLE001
                continue

        try:
            result = self._client.create_image_note(
                title=title,
                desc=desc,
                files=paths,
                topics=topic_payload,
                is_private=is_private,
            )
        except NeedVerifyError as exc:
            return {
                "ok": False,
                "error": "触发风控验证，请改用创作者后台手动发布或 Playwright",
                "verify": str(exc),
                "preview": preview,
            }
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": str(exc), "preview": preview}

        return {"ok": True, "result": result, "preview": preview}

    def demo_sign(self, uri: str, data: dict[str, Any] | None = None) -> dict[str, str]:
        a1 = self._raw_cookies.get("a1", "")
        return generate_sign_headers(uri, data, a1=a1)


def _guess_image_size(path: Path) -> tuple[int, int]:
    # 发布接口不强制宽高；上传后由平台解析
    return 1080, 1440
