#!/usr/bin/env python3
"""Apply a strict, idempotent AVPlay letterbox fix, aborting if upstream changes."""
from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: apply-letterbox.py jellyfin-tizen/avplayVideoPlayer.js")
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
needle = "            webapis.avplay.setDisplayRect(elem.offsetLeft, elem.offsetTop, elem.offsetWidth, elem.offsetHeight);"
method = "            webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX');"
if method in s:
    if s.count(method) != 1 or s.count(needle) != 1 or s.index(method) > s.index(needle):
        raise SystemExit("ERROR: Unexpected existing display method")
    print("OK: letterbox already applied")
elif s.count(needle) == 1:
    s = s.replace(needle, "            // Preserve cinematic aspect ratio while using AVPlay for HDR/HDR10+.\n" + method + "\n" + needle, 1)
    p.write_text(s, encoding="utf-8")
    print("OK: AVPlay letterbox applied")
else:
    raise SystemExit(f"ERROR: upstream AVPlay changed; found {s.count(needle)} display rectangles")
