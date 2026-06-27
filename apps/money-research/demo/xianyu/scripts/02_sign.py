#!/usr/bin/env python3
"""02 - Mtop H5 签名生成与校验"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.sign import APP_KEY, generate_device_id, generate_sign


def main() -> int:
    parser = argparse.ArgumentParser(description="闲鱼 Web Mtop 签名工具")
    parser.add_argument("--token", help="_m_h5_tk 前半段 token")
    parser.add_argument("--t", help="毫秒时间戳，默认当前时间")
    parser.add_argument("--data", default='{}', help="请求 data JSON 字符串")
    parser.add_argument("--app-key", default=APP_KEY)
    parser.add_argument("--user-id", help="演示 generate_device_id，传入 unb")
    args = parser.parse_args()

    t = args.t or str(int(time.time() * 1000))
    token = args.token or "demo_token_replace_with_real"

    sign = generate_sign(t, token, args.data, args.app_key)
    payload = {
        "ok": True,
        "app_key": args.app_key,
        "t": t,
        "token": token,
        "data": args.data,
        "sign": sign,
        "formula": "MD5(token + '&' + t + '&' + appKey + '&' + data)",
    }

    if args.user_id:
        payload["device_id"] = generate_device_id(args.user_id)

    # 内置自测样例（不依赖真实 Cookie）
    sample_data = '{"appKey":"444e9908a51d1cb236a27862abc769c9","deviceId":"DEMO-DEVICE"}'
    payload["self_test"] = {
        "data": sample_data,
        "sign": generate_sign(t, token, sample_data, args.app_key),
    }

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
