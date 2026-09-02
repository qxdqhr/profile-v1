#!/usr/bin/env python3
"""03 - 笔记文案生成"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.copywriting import build_note_copy


def main() -> int:
    parser = argparse.ArgumentParser(description="小红书笔记标题与正文生成")
    parser.add_argument("--topic", required=True, help="主题/话题")
    parser.add_argument("--mood", default="分享", help="标题情绪词")
    parser.add_argument("--location", default="", help="地点")
    parser.add_argument("--highlights", nargs="*", default=["真实体验", "干货满满", "欢迎交流"])
    parser.add_argument("--extra", default="", help="补充段落")
    args = parser.parse_args()

    result = build_note_copy(
        topic=args.topic,
        highlights=args.highlights,
        mood=args.mood,
        location=args.location,
        extra=args.extra,
    )
    result["ok"] = True
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
