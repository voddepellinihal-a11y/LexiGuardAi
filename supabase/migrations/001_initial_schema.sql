-- LexiGuard AI Database Migration
-- Version: 001_initial_schema

-- Enable pgvector
create extension if not exists vector;

-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  document_type text,
  storage_path text not null,
  file_size bigint,
  page_count integer,
  status text not null default 'uploaded',
  processing_error text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- document_sections
create table if not exists document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  section_number text,
  title text,
  content text not null,
  page_start integer,
  page_end integer,
  section_order integer,
  created_at timestamptz default now()
);

-- clauses
create table if not exists clauses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  section_id uuid references document_sections(id) on delete cascade,
  section_number text,
  title text,
  content text not null,
  page_number integer,
  clause_order integer,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- analyses
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  negotiation_stance text default 'balanced',
  overall_score numeric,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- risk_findings
create table if not exists risk_findings (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  clause_id uuid references clauses(id) on delete set null,
  category text not null,
  severity text not null,
  score numeric,
  title text not null,
  explanation text,
  potential_impact text,
  evidence text,
  source_page integer,
  created_at timestamptz default now()
);

-- obligations
create table if not exists obligations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  clause_id uuid references clauses(id) on delete set null,
  party text,
  action text,
  deadline text,
  condition text,
  source text
);

-- comparisons
create table if not exists comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_a_id uuid not null references documents(id) on delete cascade,
  document_b_id uuid not null references documents(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- comparison_changes
create table if not exists comparison_changes (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  change_type text not null,
  section text,
  severity text,
  description text,
  evidence_a text,
  evidence_b text,
  created_at timestamptz default now()
);

-- chat_sessions
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  created_at timestamptz default now()
);

-- chat_messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  grounded boolean default false,
  created_at timestamptz default now()
);

-- citations
create table if not exists citations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references chat_messages(id) on delete cascade,
  clause_id uuid references clauses(id) on delete set null,
  section text,
  page_number integer,
  quoted_text text
);

-- consultation_sheets
create table if not exists consultation_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists documents_user_id_idx on documents(user_id);
create index if not exists clauses_document_id_idx on clauses(document_id);
create index if not exists risk_findings_analysis_id_idx on risk_findings(analysis_id);
create index if not exists risk_findings_document_id_idx on risk_findings(document_id);
create index if not exists obligations_document_id_idx on obligations(document_id);
create index if not exists comparisons_user_id_idx on comparisons(user_id);
create index if not exists chat_sessions_document_id_idx on chat_sessions(document_id);
create index if not exists chat_messages_session_id_idx on chat_messages(session_id);
create index if not exists citations_message_id_idx on citations(message_id);
create index if not exists consultation_sheets_document_id_idx on consultation_sheets(document_id);

-- pgvector index for clause similarity search
create index if not exists clauses_embedding_idx on clauses using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Vector search function
create or replace function search_clauses(
  query_embedding text,
  p_document_id uuid,
  p_limit int default 5
)
returns table (
  id uuid,
  document_id uuid,
  section_number text,
  title text,
  content text,
  page_number integer,
  similarity float
)
language sql
as $$
  select
    c.id,
    c.document_id,
    c.section_number,
    c.title,
    c.content,
    c.page_number,
    1 - (c.embedding::text::vector <=> query_embedding::vector) as similarity
  from clauses c
  where c.document_id = p_document_id
  order by c.embedding::text::vector <=> query_embedding::vector
  limit p_limit;
$$;

-- Row Level Security

alter table profiles enable row level security;
alter table documents enable row level security;
alter table document_sections enable row level security;
alter table clauses enable row level security;
alter table analyses enable row level security;
alter table risk_findings enable row level security;
alter table obligations enable row level security;
alter table comparisons enable row level security;
alter table comparison_changes enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table citations enable row level security;
alter table consultation_sheets enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Documents policies
create policy "Users can view own documents" on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents for delete using (auth.uid() = user_id);

-- Document sections policies
create policy "Users can view own document sections" on document_sections for select
  using (exists (select 1 from documents where documents.id = document_sections.document_id and documents.user_id = auth.uid()));
create policy "Users can insert own document sections" on document_sections for insert
  with check (exists (select 1 from documents where documents.id = document_sections.document_id and documents.user_id = auth.uid()));

-- Clauses policies
create policy "Users can view own clauses" on clauses for select
  using (exists (select 1 from documents where documents.id = clauses.document_id and documents.user_id = auth.uid()));
create policy "Users can insert own clauses" on clauses for insert
  with check (exists (select 1 from documents where documents.id = clauses.document_id and documents.user_id = auth.uid()));

-- Analyses policies
create policy "Users can view own analyses" on analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on analyses for insert with check (auth.uid() = user_id);
create policy "Users can update own analyses" on analyses for update using (auth.uid() = user_id);

-- Risk findings policies
create policy "Users can view own risk findings" on risk_findings for select
  using (exists (select 1 from analyses where analyses.id = risk_findings.analysis_id and analyses.user_id = auth.uid()));
create policy "Users can insert own risk findings" on risk_findings for insert
  with check (exists (select 1 from analyses where analyses.id = risk_findings.analysis_id and analyses.user_id = auth.uid()));

-- Obligations policies
create policy "Users can view own obligations" on obligations for select
  using (exists (select 1 from documents where documents.id = obligations.document_id and documents.user_id = auth.uid()));
create policy "Users can insert own obligations" on obligations for insert
  with check (exists (select 1 from documents where documents.id = obligations.document_id and documents.user_id = auth.uid()));

-- Comparisons policies
create policy "Users can view own comparisons" on comparisons for select using (auth.uid() = user_id);
create policy "Users can insert own comparisons" on comparisons for insert with check (auth.uid() = user_id);

-- Comparison changes policies
create policy "Users can view own comparison changes" on comparison_changes for select
  using (exists (select 1 from comparisons where comparisons.id = comparison_changes.comparison_id and comparisons.user_id = auth.uid()));
create policy "Users can insert own comparison changes" on comparison_changes for insert
  with check (exists (select 1 from comparisons where comparisons.id = comparison_changes.comparison_id and comparisons.user_id = auth.uid()));

-- Chat sessions policies
create policy "Users can view own chat sessions" on chat_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own chat sessions" on chat_sessions for insert with check (auth.uid() = user_id);

-- Chat messages policies
create policy "Users can view own chat messages" on chat_messages for select
  using (exists (select 1 from chat_sessions where chat_sessions.id = chat_messages.session_id and chat_sessions.user_id = auth.uid()));
create policy "Users can insert own chat messages" on chat_messages for insert
  with check (exists (select 1 from chat_sessions where chat_sessions.id = chat_messages.session_id and chat_sessions.user_id = auth.uid()));

-- Citations policies
create policy "Users can view own citations" on citations for select
  using (exists (
    select 1 from chat_messages
    join chat_sessions on chat_sessions.id = chat_messages.session_id
    where chat_messages.id = citations.message_id and chat_sessions.user_id = auth.uid()
  ));
create policy "Users can insert own citations" on citations for insert
  with check (exists (
    select 1 from chat_messages
    join chat_sessions on chat_sessions.id = chat_messages.session_id
    where chat_messages.id = citations.message_id and chat_sessions.user_id = auth.uid()
  ));

-- Consultation sheets policies
create policy "Users can view own consultation sheets" on consultation_sheets for select using (auth.uid() = user_id);
create policy "Users can insert own consultation sheets" on consultation_sheets for insert with check (auth.uid() = user_id);

-- Storage bucket (run in Supabase Dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('legal-documents', 'legal-documents', false);

-- Storage policies
create policy "Users can upload to own folder" on storage.objects for insert
  with check (bucket_id = 'legal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own files" on storage.objects for select
  using (bucket_id = 'legal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own files" on storage.objects for delete
  using (bucket_id = 'legal-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
