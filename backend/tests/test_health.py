"""Smoke test for the health endpoint (no DB or API keys needed)."""

import asyncio

from app.api.health import health_check


def test_health_check_returns_healthy():
    result = asyncio.run(health_check())
    assert result.status == "healthy"
    assert result.version == "1.0.0"
