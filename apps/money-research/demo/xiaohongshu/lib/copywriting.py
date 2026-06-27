"""小红书笔记文案生成"""

from __future__ import annotations

from typing import Any


def build_note_copy(
    *,
    topic: str,
    highlights: list[str] | None = None,
    mood: str = "分享",
    location: str = "",
    extra: str = "",
    max_title_len: int = 20,
) -> dict[str, Any]:
    highlights = highlights or ["真实体验", "干货满满", "欢迎交流"]
    title = _build_title(topic, mood, max_title_len)
    desc, tags = _build_desc(topic, highlights, location, extra)
    return {
        "title": title,
        "desc": desc,
        "topics": tags,
        "title_length": len(title),
        "desc_length": len(desc),
        "sections": {
            "topic": topic,
            "highlights": highlights,
            "mood": mood,
            "location": location,
        },
    }


def _build_title(topic: str, mood: str, max_len: int) -> str:
    base = f"{mood}｜{topic.strip()}"
    if len(base) <= max_len:
        return base
    # 小红书标题建议 ≤20 字
    trimmed = topic.strip()
    suffix = f"｜{mood}"
    max_topic = max_len - len(suffix)
    if max_topic < 2:
        return trimmed[:max_len]
    return f"{trimmed[:max_topic]}{suffix}"


def _build_desc(
    topic: str,
    highlights: list[str],
    location: str,
    extra: str,
) -> tuple[str, list[str]]:
    tags = [topic.strip(), "生活记录", "日常分享"]
    tag_line = " ".join(f"#{t}" for t in tags if t)

    lines = [
        f"今天来聊聊【{topic.strip()}】✨",
        "",
        "【亮点】",
    ]
    lines.extend(f"· {item}" for item in highlights)

    if location.strip():
        lines.extend(["", f"📍 {location.strip()}"])

    if extra.strip():
        lines.extend(["", extra.strip()])

    lines.extend(
        [
            "",
            "有问题欢迎评论区聊～",
            "",
            tag_line,
        ]
    )
    return "\n".join(lines), tags
