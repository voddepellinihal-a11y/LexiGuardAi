"""Tests for LLM JSON parsing helper (app/services/llm_service.py)."""

import pytest

from app.services.llm_service import _parse_llm_json


def test_parses_plain_json():
    assert _parse_llm_json('{"score": 72, "ok": true}') == {"score": 72, "ok": True}


def test_parses_fenced_json():
    text = '```json\n{"score": 72}\n```'
    assert _parse_llm_json(text) == {"score": 72}


def test_parses_fenced_json_with_surrounding_whitespace():
    text = '  ```\n{"a": 1}\n```  '
    assert _parse_llm_json(text) == {"a": 1}


def test_invalid_json_raises():
    with pytest.raises(ValueError):
        _parse_llm_json("not json at all {{{")
