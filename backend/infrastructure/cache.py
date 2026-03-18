import diskcache
from pathlib import Path


CACHE_DIR = Path.home() / ".agentcore-memory-viz" / "cache"


class DiskCache:
    def __init__(self):
        self.cache = diskcache.Cache(str(CACHE_DIR))

    def get(self, key: str):
        return self.cache.get(key)

    def set(self, key: str, value, ttl: int = 300):
        self.cache.set(key, value, expire=ttl)
