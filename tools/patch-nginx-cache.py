from __future__ import annotations

from pathlib import Path

VHOST_PATH = Path("/www/server/panel/vhost/nginx/77.237.239.235.conf")


def main() -> int:
    if not VHOST_PATH.exists():
        print(f"[ERROR] vhost config not found: {VHOST_PATH}")
        return 2

    text = VHOST_PATH.read_text(encoding="utf-8", errors="ignore")

    # Idempotent
    if "location = /sw.js" in text and "location = /index.html" in text:
        print("[OK] no-cache rules already present")
        return 0

    needle = "    # SPA routing - React Router support\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n"

    if needle not in text:
        print("[ERROR] could not find SPA location block to patch")
        return 3

    insert = (
        needle
        + "\n"
        + "    # PWA / SPA: do not cache entrypoints (prevents old builds)\n"
        + "    location = /index.html {\n"
        + "        add_header Cache-Control \"no-cache\";\n"
        + "    }\n\n"
        + "    location = /sw.js {\n"
        + "        add_header Cache-Control \"no-cache\";\n"
        + "    }\n"
    )

    VHOST_PATH.write_text(text.replace(needle, insert), encoding="utf-8")
    print("[OK] patched vhost config")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
