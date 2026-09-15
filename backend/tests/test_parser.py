"""Tests for document section/clause extraction (app/services/document_parser.py)."""

import asyncio

import pytest

from app.services.document_parser import DocumentParser

# _split_into_sections / extract_clauses are pure: no supabase access.
parser = DocumentParser(supabase=None)


def test_splits_numbered_sections():
    content = "1. SCOPE OF SERVICES\nProvider shall deliver.\n\n2. TERM\nTwelve months."
    sections = parser._split_into_sections(content)
    assert [s["title"] for s in sections] == ["1. SCOPE OF SERVICES", "2. TERM"]
    assert "Twelve months" in sections[1]["content"]


def test_unstructured_text_becomes_single_section():
    sections = parser._split_into_sections("Just some plain contract prose.")
    assert len(sections) == 1
    assert "plain contract prose" in sections[0]["content"]


def test_empty_content_becomes_single_section():
    sections = parser._split_into_sections("")
    assert len(sections) == 1


def test_extract_clauses_splits_paragraphs():
    sections = [
        {
            "title": "Compensation",
            "content": "Client shall pay $10,000 monthly for all services rendered here.\n\nLate payments incur a 1.5 percent monthly penalty on balances.",
            "section_number": "3",
            "page_start": 1,
        }
    ]
    clauses = parser.extract_clauses(sections)
    assert len(clauses) == 2
    assert clauses[0]["clause_order"] == 0
    assert clauses[1]["clause_order"] == 1
    assert all(c["page_number"] == 1 for c in clauses)


def test_extract_clauses_skips_fragments():
    sections = [{"title": "T", "content": "Too short.\n\nThis paragraph is definitely long enough to be a clause here.", "page_start": 1}]
    clauses = parser.extract_clauses(sections)
    assert len(clauses) == 1
    assert "long enough" in clauses[0]["content"]


def test_parse_file_rejects_bad_extension():
    with pytest.raises(ValueError, match="Unsupported file type"):
        asyncio.run(parser.parse_file(b"data", "contract.exe"))


def test_parse_text_roundtrip():
    result = asyncio.run(parser.parse_file(b"1. TERM\nTwelve months of service.", "a.txt"))
    assert result["page_count"] == 1
    assert "Twelve months" in result["full_text"]
    assert len(result["sections"]) == 1
