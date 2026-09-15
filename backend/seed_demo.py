"""
LexiGuard AI Demo Data Seeder
Run after Supabase is configured with real credentials.

Usage:
  cd legal-ai
  python backend/seed_demo.py --email user@example.com --password yourpassword

Or set env vars:
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  LLM_API_KEY=your-openai-key
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path
from datetime import datetime, timedelta

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")


def signup_and_login(email: str, password: str) -> str:
    """Create account and return JWT token."""
    from supabase import create_client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_ANON_KEY env vars")
        sys.exit(1)

    client = create_client(url, key)
    res = client.auth.sign_up({"email": email, "password": password})
    if not res.session:
        # Already exists, sign in
        res = client.auth.sign_in_with_password({"email": email, "password": password})
    print(f"Logged in as {email}")
    return res.session.access_token


def api_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def upload_document(token: str, filepath: str) -> dict:
    """Upload a document file."""
    with open(filepath, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/documents",
            headers=api_headers(token),
            files={"file": (Path(filepath).name, f, "text/plain")},
        )
    resp.raise_for_status()
    doc = resp.json()
    print(f"  Uploaded: {doc['filename']} -> {doc['id']}")
    return doc


def process_document(token: str, doc_id: str) -> dict:
    """Process document (parse + embed)."""
    resp = requests.post(
        f"{API_BASE}/documents/{doc_id}/process",
        headers=api_headers(token),
    )
    resp.raise_for_status()
    result = resp.json()
    print(f"  Processed: {result.get('sections_count', 0)} sections, {result.get('clauses_count', 0)} clauses")
    return result


def run_analysis(token: str, doc_id: str, role: str, stance: str) -> dict:
    """Run role-aware risk analysis."""
    resp = requests.post(
        f"{API_BASE}/documents/{doc_id}/analyze",
        headers=api_headers(token),
        json={"role": role, "negotiation_stance": stance},
    )
    resp.raise_for_status()
    result = resp.json()
    print(f"  Analyzed as {role}/{stance}: score={result.get('overall_score', 'N/A')}")
    return result


def ask_question(token: str, doc_id: str, question: str) -> dict:
    """Ask a question about a document."""
    resp = requests.post(
        f"{API_BASE}/documents/{doc_id}/chat",
        headers=api_headers(token),
        json={"question": question},
    )
    resp.raise_for_status()
    result = resp.json()
    print(f"  Q: {question[:50]}...")
    print(f"  A: {result.get('answer', '')[:80]}...")
    return result


def compare_documents(token: str, doc_a_id: str, doc_b_id: str) -> dict:
    """Compare two document versions."""
    resp = requests.post(
        f"{API_BASE}/comparisons",
        headers=api_headers(token),
        json={"document_a_id": doc_a_id, "document_b_id": doc_b_id},
    )
    resp.raise_for_status()
    result = resp.json()
    print(f"  Compared: {result.get('changes_count', 0)} changes detected")
    return result


def generate_consultation(token: str, doc_id: str) -> dict:
    """Generate attorney consultation prep sheet."""
    resp = requests.post(
        f"{API_BASE}/documents/{doc_id}/consultation-sheet",
        headers=api_headers(token),
    )
    resp.raise_for_status()
    result = resp.json()
    print(f"  Consultation sheet generated for {doc_id}")
    return result


DEMO_DIR = Path(__file__).parent.parent / "demo"


def seed_all(email: str, password: str):
    """Full demo seed: upload, process, analyze, chat, compare, consult."""
    print("=" * 60)
    print("LexiGuard AI - Demo Data Seeder")
    print("=" * 60)

    token = signup_and_login(email, password)
    uploaded = {}

    # --- MODULE 1: Document Ingestion ---
    print("\n[1/6] Uploading demo documents...")
    demo_files = [
        ("service_agreement_v1", "service_agreement_v1.txt"),
        ("service_agreement_v2", "service_agreement_v2.txt"),
        ("nda", "nda.txt"),
        ("employment_agreement", "employment_agreement.txt"),
        ("saas_subscription", "saas_subscription.txt"),
        ("commercial_lease", "commercial_lease.txt"),
    ]

    for key, filename in demo_files:
        filepath = DEMO_DIR / filename
        if not filepath.exists():
            print(f"  SKIP: {filename} not found")
            continue
        doc = upload_document(token, str(filepath))
        uploaded[key] = doc["id"]

    # Process all documents
    print("\n  Processing documents...")
    for key, doc_id in uploaded.items():
        try:
            process_document(token, doc_id)
            time.sleep(0.5)
        except Exception as e:
            print(f"  WARN: {key} processing failed: {e}")

    # --- MODULE 2 & 3: Role-Aware Risk Analysis ---
    print("\n[2/6] Running role-aware risk analyses...")
    analyses = [
        ("service_agreement_v1", "Service Provider", "Aggressive"),
        ("service_agreement_v1", "Client", "Balanced"),
        ("nda", "General Party", "Balanced"),
        ("employment_agreement", "Employee", "Aggressive"),
        ("saas_subscription", "Customer", "Balanced"),
        ("commercial_lease", "Tenant", "Flexible"),
    ]

    for key, role, stance in analyses:
        if key not in uploaded:
            continue
        try:
            run_analysis(token, uploaded[key], role, stance)
            time.sleep(0.5)
        except Exception as e:
            print(f"  WARN: {key} analysis failed: {e}")

    # --- MODULE 5: RAG Chat ---
    print("\n[3/6] Testing RAG Q&A...")
    chat_questions = [
        ("service_agreement_v1", "What are the termination provisions in this agreement?"),
        ("service_agreement_v1", "What are the financial risks I should be aware of?"),
        ("service_agreement_v1", "How does the indemnification work?"),
        ("employment_agreement", "What restrictions apply after I leave this job?"),
        ("employment_agreement", "What happens to my intellectual property?"),
        ("saas_subscription", "What happens if I want to cancel early?"),
        ("commercial_lease", "What are the penalties for late rent?"),
        ("nda", "How long does the confidentiality obligation last?"),
    ]

    for key, question in chat_questions:
        if key not in uploaded:
            continue
        try:
            ask_question(token, uploaded[key], question)
            time.sleep(0.5)
        except Exception as e:
            print(f"  WARN: chat failed for {key}: {e}")

    # --- MODULE 4: Semantic Comparison ---
    print("\n[4/6] Running semantic comparison (v1 vs v2)...")
    if "service_agreement_v1" in uploaded and "service_agreement_v2" in uploaded:
        try:
            compare_documents(token, uploaded["service_agreement_v1"], uploaded["service_agreement_v2"])
        except Exception as e:
            print(f"  WARN: comparison failed: {e}")

    # --- MODULE 6: Consultation Sheet ---
    print("\n[5/6] Generating consultation prep sheets...")
    for key in ["service_agreement_v1", "employment_agreement", "commercial_lease"]:
        if key not in uploaded:
            continue
        try:
            generate_consultation(token, uploaded[key])
            time.sleep(0.5)
        except Exception as e:
            print(f"  WARN: consultation failed for {key}: {e}")

    # --- Summary ---
    print("\n[6/6] Seed complete!")
    print("=" * 60)
    print(f"Documents uploaded:  {len(uploaded)}")
    print(f"Analyses run:       {len(analyses)}")
    print(f"Chat questions:     {len(chat_questions)}")
    print(f"Comparisons:        1 (v1 vs v2)")
    print(f"Consultation sheets: 3")
    print("=" * 60)
    print("\nDemo data is ready. Open http://localhost:3000 to explore.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed LexiGuard AI with demo data")
    parser.add_argument("--email", default=os.getenv("DEMO_EMAIL", "demo@lexiguard.ai"))
    parser.add_argument("--password", default=os.getenv("DEMO_PASSWORD", "demo123456"))
    args = parser.parse_args()

    seed_all(args.email, args.password)
