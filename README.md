# LexiGuard AI

AI-Powered Legal Assistance & Contract Intelligence Platform

## Overview

LexiGuard AI is a GenAI-powered legal document intelligence system that helps users understand, analyze, compare, and navigate legal documents. It provides legal information and document assistance only — it never claims to replace a lawyer or provide definitive professional legal advice.

## Features

- **Document Upload & Processing** — PDF, DOCX, TXT, and image support with OCR
- **Role-Aware Risk Analysis** — Risk scoring (0-100) based on your contractual role
- **Plain-English Explanations** — Complex clauses explained in simple language
- **Semantic Document Comparison** — Detect added obligations, liability shifts, and removed protections
- **Document-Grounded Q&A** — Ask questions with source citations
- **Consultation Preparation** — Generate lawyer prep sheets with key risks and questions
- **Secure & Private** — Supabase Auth, RLS, private storage buckets

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI, LangGraph |
| Database | Supabase PostgreSQL, pgvector |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage (private buckets) |
| AI | OpenAI (LLM + Embeddings) |
| Document Parsing | Docling, OCR fallback |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- Supabase project
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` in the backend directory
3. Copy `frontend/.env.local.example` to `frontend/.env.local`
4. Fill in your Supabase and OpenAI credentials

### Database Setup

1. Create a Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Create the `legal-documents` storage bucket (private)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker Setup

```bash
docker-compose up
```

## API Documentation

Once running, visit `http://localhost:8000/api/docs` for the OpenAPI documentation.

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/documents` | Upload a document |
| GET | `/api/v1/documents` | List documents |
| POST | `/api/v1/documents/{id}/process` | Process document |
| POST | `/api/v1/documents/{id}/analyze` | Run risk analysis |
| GET | `/api/v1/documents/{id}/risks` | Get risk findings |
| POST | `/api/v1/documents/{id}/chat` | Ask a question |
| POST | `/api/v1/comparisons` | Compare documents |
| POST | `/api/v1/documents/{id}/consultation-sheet` | Generate consultation sheet |

## Project Structure

```
legal-ai/
├── frontend/          # Next.js frontend
│   ├── app/           # Pages and routes
│   ├── components/    # React components
│   ├── hooks/         # React hooks
│   ├── lib/           # Utilities and API client
│   └── types/         # TypeScript types
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── core/      # Config, auth, database
│   │   ├── services/  # Business logic
│   │   ├── repositories/ # Data access
│   │   ├── schemas/   # Pydantic models
│   │   ├── workflows/ # LangGraph workflows
│   │   └── utils/     # Utilities
│   └── tests/
├── supabase/          # Database migrations
├── demo/              # Demo contracts
└── docs/              # Documentation
```

## Security

- Row Level Security (RLS) on all tables
- Private storage buckets with signed URLs
- JWT authentication
- Rate limiting on AI endpoints
- Prompt injection protection
- No raw document logging

## Legal Disclaimer

This platform provides legal information and document analysis for assistance and educational purposes. It does not provide formal legal advice, does not replace a qualified legal professional, and does not create an attorney-client relationship.
