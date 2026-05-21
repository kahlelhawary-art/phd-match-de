-- ─────────────────────────────────────────────────────────────
-- PhD Match DE — Supabase Schema
-- Region: Frankfurt (eu-central-1) recommended
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- enable extensions
create extension if not exists "uuid-ossp";

-- ─── 1. Institutions ──────────────────────────────────────────
create table if not exists institutions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  short_name text,
  city text not null,
  state text,
  type text check (type in ('helmholtz', 'max_planck', 'university', 'leibniz', 'dzne', 'university_hospital', 'other')),
  website text,
  logo_url text,
  description text,
  created_at timestamptz default now()
);

-- ─── 2. Programmes (formal PhD programmes/graduate schools) ──
create table if not exists programmes (
  id uuid primary key default uuid_generate_v4(),
  institution_id uuid references institutions(id) on delete cascade,
  name text not null,
  short_name text,
  fields text[] not null default '{}',  -- e.g. {cancer, immunology}
  language text check (language in ('german','english','bilingual')) default 'english',
  funding_info text,
  is_funded boolean default true,
  application_deadline date,
  is_rolling boolean default false,
  next_intake text,
  duration_months integer default 36,
  website text,
  description text,
  description_de text,
  description_ar text,
  open_for_applications boolean default true,
  created_at timestamptz default now()
);

-- ─── 3. Principal Investigators (labs) ───────────────────────
create table if not exists pis (
  id uuid primary key default uuid_generate_v4(),
  institution_id uuid references institutions(id) on delete set null,
  programme_id uuid references programmes(id) on delete set null,
  name text not null,
  title text,                            -- Prof. Dr., PD Dr. etc.
  fields text[] not null default '{}',
  research_focus text,
  research_focus_de text,
  research_focus_ar text,
  lab_url text,
  email text,
  accepting_students boolean default true,
  recent_papers jsonb default '[]'::jsonb,  -- [{title, journal, year, url}]
  notes text,
  created_at timestamptz default now()
);

-- ─── 4. User profile (single user app — extend with auth) ────
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,                          -- supabase auth.users.id
  full_name text,
  master_degree text,
  master_university text,
  master_thesis_topic text,
  cv_text text,
  fields_of_interest text[] default '{}',
  cities_preferred text[] default '{}',
  languages jsonb default '[]'::jsonb,   -- [{code:'de', level:'B1'}]
  email text,
  phone text,
  linkedin text,
  orcid text,
  updated_at timestamptz default now()
);

-- ─── 5. Applications tracker ──────────────────────────────────
create type application_status as enum (
  'interested',
  'contacted',
  'applied',
  'interview',
  'offered',
  'rejected',
  'withdrawn'
);

create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  pi_id uuid references pis(id) on delete set null,
  programme_id uuid references programmes(id) on delete set null,
  status application_status default 'interested',
  applied_at date,
  deadline date,
  next_action text,
  next_action_at date,
  notes text,
  cover_letter_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 6. Generated cover letters (Anschreiben) ────────────────
create table if not exists cover_letters (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references applications(id) on delete cascade,
  language text check (language in ('german','english')) default 'german',
  subject text,
  body text,
  version integer default 1,
  generated_with text default 'claude-opus-4-5',
  created_at timestamptz default now()
);

-- ─── 7. Outreach emails (direct PI contact) ──────────────────
create table if not exists outreach (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  pi_id uuid references pis(id) on delete cascade,
  subject text,
  body text,
  language text default 'english',
  sent_at timestamptz,
  response_received boolean default false,
  response_summary text,
  created_at timestamptz default now()
);

-- ─── 8. Saved (bookmarked) opportunities ─────────────────────
create table if not exists saved_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  pi_id uuid references pis(id) on delete cascade,
  programme_id uuid references programmes(id) on delete cascade,
  created_at timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists idx_pis_fields on pis using gin(fields);
create index if not exists idx_programmes_fields on programmes using gin(fields);
create index if not exists idx_institutions_city on institutions(city);
create index if not exists idx_applications_status on applications(status);

-- ─── Row Level Security (basic — extend for multi-user) ──────
alter table profiles enable row level security;
alter table applications enable row level security;
alter table cover_letters enable row level security;
alter table outreach enable row level security;
alter table saved_items enable row level security;

-- For single-user dev: permissive policy. Replace with auth.uid() = user_id in prod.
create policy "dev_full_access_profiles" on profiles for all using (true) with check (true);
create policy "dev_full_access_applications" on applications for all using (true) with check (true);
create policy "dev_full_access_cover_letters" on cover_letters for all using (true) with check (true);
create policy "dev_full_access_outreach" on outreach for all using (true) with check (true);
create policy "dev_full_access_saved" on saved_items for all using (true) with check (true);

-- Read-only public access for catalogue tables
alter table institutions enable row level security;
alter table programmes enable row level security;
alter table pis enable row level security;
create policy "public_read_institutions" on institutions for select using (true);
create policy "public_read_programmes" on programmes for select using (true);
create policy "public_read_pis" on pis for select using (true);
