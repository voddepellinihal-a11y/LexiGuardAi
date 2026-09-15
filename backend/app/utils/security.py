PROMPT_INJECTION_PATTERNS = [
    "ignore previous instructions",
    "ignore all previous instructions",
    "disregard previous instructions",
    "disregard all previous instructions",
    "forget previous instructions",
    "forget all previous instructions",
    "ignore the above instructions",
    "ignore the above",
    "disregard the above",
    "you are now",
    "act as if you are",
    "pretend you are",
    "from now on you are",
    "new instructions:",
    "system prompt:",
    "override instructions",
    "ignore system prompt",
    "bypass safety",
    "jailbreak",
    "DAN mode",
    "developer mode",
]


def detect_prompt_injection(text: str) -> bool:
    text_lower = text.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern in text_lower:
            return True
    return False


def sanitize_document_text(text: str) -> str:
    if detect_prompt_injection(text):
        return f"[DOCUMENT TEXT - CONTENT FLAGGED]\n\n{text}"
    return text


def sanitize_for_llm_context(text: str) -> str:
    sanitized = text
    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = sanitized.replace(pattern, "[REDACTED]")
        sanitized = sanitized.replace(pattern.upper(), "[REDACTED]")
    return sanitized
