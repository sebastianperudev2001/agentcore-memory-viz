from __future__ import annotations

from typing import Optional
from urllib.parse import unquote


def normalize_identifier(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    normalized = value
    for _ in range(3):
        decoded = unquote(normalized)
        if decoded == normalized:
            break
        normalized = decoded

    return normalized
