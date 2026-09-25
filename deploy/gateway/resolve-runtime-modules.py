#!/usr/bin/env python3
"""Resolve deploy/runtime-modules.json → shell-friendly service lists.

Usage:
  eval "$(python3 resolve-runtime-modules.py [/path/to/runtime-modules.json])"
  # exports: RUNTIME_APP_SERVICES, RUNTIME_WP_SERVICES, RUNTIME_ENABLED_CSV, RUNTIME_DISABLED_CSV
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# module key in JSON → compose service name(s)
MODULE_COMPOSE: dict[str, list[str]] = {
    "web": ["web"],
    "calendar": ["calendar"],
    "teach_hub": ["teach_hub"],
    "showmasterpiece": ["showmasterpiece"],
    "money_research": ["money_research"],
    "node_notes": ["node_notes"],
    "idea_list": ["idea_list"],
    "filetransfer": ["filetransfer"],
    "ticket_monitor": ["ticket_monitor"],
    "fitness_plan": ["fitness_plan"],
    "comfy_prompt": ["comfy_prompt"],
    "utilities": ["utilities"],
    "wordpress_holt": ["wp_mariadb", "wordpress_holt"],
}

REQUIRED = ("web",)
KNOWN = tuple(MODULE_COMPOSE.keys())


def load(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"ERROR: {path} must be a JSON object")
    return data


def main() -> None:
    here = Path(__file__).resolve().parent
    default = here.parent / "runtime-modules.json"
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else default
    if not path.is_file():
        raise SystemExit(f"ERROR: missing runtime modules file: {path}")

    raw = load(path)
    unknown = [k for k in raw if not str(k).startswith("_") and k not in MODULE_COMPOSE]
    if unknown:
        raise SystemExit(f"ERROR: unknown module keys in {path}: {', '.join(unknown)}")

    enabled: list[str] = []
    disabled: list[str] = []
    app_services: list[str] = []
    wp_services: list[str] = []

    for key in KNOWN:
        on = bool(raw.get(key, False))
        if key in REQUIRED and not on:
            raise SystemExit(f"ERROR: module '{key}' is required and must be true")
        if on:
            enabled.append(key)
            for svc in MODULE_COMPOSE[key]:
                if key == "wordpress_holt":
                    wp_services.append(svc)
                else:
                    app_services.append(svc)
        else:
            disabled.append(key)

    # stable unique order
    def uniq(xs: list[str]) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for x in xs:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out

    app_services = uniq(app_services)
    wp_services = uniq(wp_services)

    def sh_escape(s: str) -> str:
        return "'" + s.replace("'", "'\"'\"'") + "'"

    print(f"RUNTIME_MODULES_FILE={sh_escape(str(path))}")
    print(f"RUNTIME_APP_SERVICES={sh_escape(' '.join(app_services))}")
    print(f"RUNTIME_WP_SERVICES={sh_escape(' '.join(wp_services))}")
    print(f"RUNTIME_ENABLED_CSV={sh_escape(','.join(enabled))}")
    print(f"RUNTIME_DISABLED_CSV={sh_escape(','.join(disabled))}")
    print(
        f"echo \"runtime-modules: enabled={','.join(enabled)} disabled={','.join(disabled)}\"",
    )


if __name__ == "__main__":
    main()
