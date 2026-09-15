import os
import tempfile
from typing import Optional, Tuple
from uuid import uuid4
from supabase import Client
from app.core.config import settings
import structlog

logger = structlog.get_logger()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024


class DocumentParser:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def parse_file(self, file_content: bytes, filename: str) -> dict:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type: {ext}")

        if len(file_content) > MAX_FILE_SIZE:
            raise ValueError(f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB")

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name

        try:
            if ext == ".txt":
                return await self._parse_text(tmp_path, filename)
            elif ext in {".pdf", ".docx"}:
                return await self._parse_docling(tmp_path, filename, ext)
            elif ext in {".png", ".jpg", ".jpeg", ".tiff", ".bmp"}:
                return await self._parse_ocr(tmp_path, filename)
        finally:
            os.unlink(tmp_path)

    async def _parse_text(self, path: str, filename: str) -> dict:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        sections = self._split_into_sections(content)
        return {
            "full_text": content,
            "sections": sections,
            "page_count": 1,
            "document_type": "text",
        }

    async def _parse_docling(self, path: str, filename: str, ext: str) -> dict:
        try:
            from docling.document_converter import DocumentConverter
            converter = DocumentConverter()
            result = converter.convert(path)
            doc = result.document
            full_text = doc.export_to_markdown()
            sections = self._split_into_sections(full_text)
            return {
                "full_text": full_text,
                "sections": sections,
                "page_count": len(doc.pages) if hasattr(doc, "pages") else 1,
                "document_type": ext.lstrip("."),
            }
        except Exception as e:
            logger.warning("docling_parse_failed", error=str(e))
            return await self._parse_text(path, filename)

    async def _parse_ocr(self, path: str, filename: str) -> dict:
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(path)
            text = pytesseract.image_to_string(img)
            sections = self._split_into_sections(text)
            return {
                "full_text": text,
                "sections": sections,
                "page_count": 1,
                "document_type": "ocr_image",
            }
        except Exception as e:
            logger.warning("ocr_parse_failed", error=str(e))
            return {
                "full_text": "",
                "sections": [],
                "page_count": 0,
                "document_type": "unknown",
                "error": str(e),
            }

    def _split_into_sections(self, content: str) -> list:
        import re
        section_patterns = [
            r'(?m)^#{1,3}\s+.+',
            r'(?m)^\d+\.\s+.+',
            r'(?m)^Article\s+\d+',
            r'(?m)^Section\s+\d+',
            r'(?m)^Clause\s+\d+',
        ]
        sections = []
        lines = content.split('\n')
        current_section = {"title": "Introduction", "content": "", "order": 0}
        order = 0

        for line in lines:
            is_section_start = False
            for pattern in section_patterns:
                if re.match(pattern, line.strip()):
                    is_section_start = True
                    break

            if is_section_start and line.strip():
                if current_section["content"].strip():
                    sections.append(current_section)
                    order += 1
                current_section = {
                    "title": line.strip(),
                    "content": "",
                    "order": order,
                }
            else:
                current_section["content"] += line + "\n"

        if current_section["content"].strip():
            sections.append(current_section)

        if not sections:
            sections = [{"title": "Full Document", "content": content, "order": 0}]

        return sections

    def extract_clauses(self, sections: list) -> list:
        import re
        clauses = []
        clause_order = 0
        for section in sections:
            content = section["content"]
            clause_patterns = [
                r'(?m)^\(?\d+[\.]?\d*\)?\s+.{10,}',
                r'(?m)^Article\s+\d+',
                r'(?m)^Section\s+\d+',
                r'(?m)^Clause\s+\d+',
                r'(?m)^§\s*\d+',
            ]
            parts = re.split(r'\n\s*\n', content)
            for part in parts:
                part = part.strip()
                if len(part) > 20:
                    clauses.append({
                        "title": section.get("title", "Clause"),
                        "content": part,
                        "section_number": section.get("section_number"),
                        "page_number": section.get("page_start", 1),
                        "clause_order": clause_order,
                    })
                    clause_order += 1
        return clauses
