"""Helpers for preparing GitHub release notes for the download page."""

import re


_HIDDEN_SECTIONS = {"installers", "automatic-update support files"}


def omit_download_sections(notes: str) -> str:
    """Remove download-only sections already represented by page buttons."""
    kept = []
    hidden = False
    hidden_level = 0
    for line in notes.splitlines():
        heading = re.match(r"^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$", line)
        if heading:
            level = len(heading.group(1))
            title = heading.group(2).strip().casefold()
            if hidden and level <= hidden_level:
                hidden = False
            if title in _HIDDEN_SECTIONS:
                hidden = True
                hidden_level = level
        if not hidden:
            kept.append(line)
    return "\n".join(kept).strip()
