"""In-process rate limiting.

A fixed-size sliding window keyed by client IP and bucket name. This is
deliberately simple and has a known limitation: the counters live in the
worker process, so with several workers or instances the effective limit is
per-process rather than global.

That is acceptable for its purpose here — blunting automated form submission
and password guessing on a single-instance deployment. If the API is scaled
horizontally, move these counters to Redis; the call sites do not change.
See docs/deployment.md.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.config import settings


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()
        self._last_sweep = time.monotonic()

    def _sweep(self, now: float, window: int) -> None:
        """Drop keys with no recent activity so memory does not grow forever."""
        if now - self._last_sweep < 300:
            return
        self._last_sweep = now
        stale = [key for key, hits in self._hits.items() if not hits or now - hits[-1] > window]
        for key in stale:
            del self._hits[key]

    def check(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        """Record a hit. Returns (allowed, seconds_until_retry)."""
        now = time.monotonic()
        with self._lock:
            self._sweep(now, window_seconds)
            hits = self._hits[key]

            cutoff = now - window_seconds
            while hits and hits[0] < cutoff:
                hits.popleft()

            if len(hits) >= limit:
                retry_after = int(hits[0] + window_seconds - now) + 1
                return False, max(retry_after, 1)

            hits.append(now)
            return True, 0

    def reset(self) -> None:
        """Clear all counters. Used between tests."""
        with self._lock:
            self._hits.clear()


limiter = SlidingWindowLimiter()


def client_identifier(request: Request) -> str:
    """Best-effort client IP.

    X-Forwarded-For is only consulted because the API is expected to sit
    behind a managed platform proxy (Render, Railway, a load balancer) that
    overwrites it. Never treat it as authenticated — it is a rate-limit key,
    not an identity.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request, bucket: str, limit: int, window_seconds: int) -> None:
    if not settings.RATE_LIMIT_ENABLED:
        return

    key = f"{bucket}:{client_identifier(request)}"
    allowed, retry_after = limiter.check(key, limit, window_seconds)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait a moment and try again.",
            headers={"Retry-After": str(retry_after)},
        )


def enquiry_rate_limit(request: Request) -> None:
    enforce_rate_limit(
        request,
        "enquiry",
        settings.ENQUIRY_RATE_LIMIT,
        settings.ENQUIRY_RATE_WINDOW_SECONDS,
    )


def login_rate_limit(request: Request) -> None:
    enforce_rate_limit(
        request,
        "login",
        settings.LOGIN_RATE_LIMIT,
        settings.LOGIN_RATE_WINDOW_SECONDS,
    )
