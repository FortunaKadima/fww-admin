# FWW Admin Dashboard — Fortuna Next Steps

**Prepared by:** Human Agency  
**Date:** April 16, 2026  
**Stack:** Next.js 15 · Supabase · Vercel · TypeScript · Tailwind CSS · Albert Sans

---

## What's in this package

| File | What it is |
|---|---|
| `fww-admin/` | Full Next.js project, ready to deploy |
| `fww-admin-mockup.html` | Interactive 9-screen design reference (open in any browser) |
| `FWW_Admin_Dashboard_Design_Review.pdf` | 9-page design review PDF |
| `FORTUNA_HANDOFF.md` | Original technical handoff notes |
| `FORTUNA_NEXT_STEPS.md` | This document |

---

## Step 1 — Supabase project

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Grab these three values from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Copy `.env.local.example` → `.env.local` and fill in the three keys

---

## Step 2 — Database schema

The app expects the following tables. Run this SQL in the Supabase **SQL Editor**:

```sql
-- Schools
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Admin users (portal logins — separate from athlete accounts)
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  school_id uuid references schools(id),
  email text not null,
  role text default 'school_admin',
  created_at timestamptz default now()
);

-- Athletes
create table athletes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  name text not null,
  email text,
  sport text,
  activated_at timestamptz,
  last_active_at timestamptz,
  total_time_seconds int default 0,
  login_count int default 0,
  budget_set boolean default false,
  created_at timestamptz default now()
);

-- Modules (7 total — seeded once)
create table modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  position int not null -- 1 through 7
);

-- Per-athlete module progress
create table module_completions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes(id) on delete cascade,
  module_id uuid references modules(id),
  status text check (status in ('not_started','in_progress','completed')),
  completed_at timestamptz,
  unique(athlete_id, module_id)
);

-- App sessions (for WAU/MAU/time-in-app queries)
create table app_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds int
);

-- Seed the 7 modules
insert into modules (title, position) values
  ('Financial Identity',    1),
  ('Budgeting Basics',      2),
  ('Banking & Credit',      3),
  ('Investing Foundations', 4),
  ('NIL & Taxes',           5),
  ('Insurance & Risk',      6),
  ('Wealth Building',       7);
```

---

## Step 3 — Row Level Security (RLS)

Enable RLS so each admin only sees their school's data:

```sql
-- Enable RLS on all tables
alter table admin_users       enable row level security;
alter table athletes           enable row level security;
alter table module_completions enable row level security;
alter table app_sessions       enable row level security;

-- Helper: get current admin's school_id
create or replace function get_school_id()
returns uuid language sql security definer as $$
  select school_id from admin_users where user_id = auth.uid() limit 1;
$$;

-- Athletes: admin sees only their school
create policy "school_athletes" on athletes
  for all using (school_id = get_school_id());

-- Module completions: via athlete
create policy "school_module_completions" on module_completions
  for all using (
    athlete_id in (select id from athletes where school_id = get_school_id())
  );

-- App sessions: via athlete
create policy "school_sessions" on app_sessions
  for all using (
    athlete_id in (select id from athletes where school_id = get_school_id())
  );

-- Admin users: see only their school's admins
create policy "school_admins" on admin_users
  for all using (school_id = get_school_id());
```

---

## Step 4 — Seed first admin

In Supabase **Auth → Users**, invite the first admin manually:

1. Click **Invite user** → enter their email
2. In the **SQL Editor**, run:

```sql
-- After the user accepts their invite, get their user_id from auth.users
-- then run:
insert into admin_users (user_id, school_id, email, role)
values (
  '<user_id from auth.users>',
  '<school_id you created>',
  'admin@school.edu',
  'school_admin'
);
```

The admin will receive an email with a link to set their password — this lands on the `/auth/confirm` page (Set Password screen).

---

## Step 5 — Vercel deploy

You're already in Vercel. Steps:

1. Push the `fww-admin/` project to a GitHub repo
2. In Vercel, **Import Project** → select the repo
3. Add environment variables (from Step 1):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL (or custom domain)
4. Deploy — Vercel handles the Next.js build automatically

---

## Step 6 — Custom domain (optional)

If FWW wants `admin.finalwhistlewealth.com`:
- Add the domain in Vercel **Project → Domains**
- Point a CNAME at `cname.vercel-dns.com` in the DNS settings

---

## Data pipeline note

The app is built assuming athlete data lives in Supabase. For the first school onboarding:

- **Option A (simplest for V1):** Manual CSV import via Supabase Table Editor
- **Option B:** Build a one-time import script that reads from FWW's existing data source and populates the `athletes` table

Confirm with the FWW team which athletes to onboard first and whether they have existing user records (email addresses) to use for `activated_at` status.

---

## Brand tokens — already applied

All brand tokens are confirmed and baked in:

| Token | Value | Source |
|---|---|---|
| Hero green | `#007c33` | `exported-styles.json` (Drive) |
| Dark green | `#015d25` | `exported-styles.json` |
| Light tint | `#d0ffd9` | `exported-styles.json` |
| Font | Albert Sans 400–800 | App Doc Assets + Drive Typefaces |
| Icons | Feather SVG (inline) | App Doc Assets — About page |
| Background | `#fbf9f6` (cream) | Figma design system |

---

## Pages included in V1

| Route | Screen |
|---|---|
| `/login` | Login |
| `/auth/confirm` | Set New Password (post-invite + post-reset) |
| `/dashboard` | Dashboard — 10 KPI tiles |
| `/athletes` | Athletes list — search, filter by sport, inactive toggle |
| `/athletes/[id]` | Athlete detail — modules, budget, time in app |
| `/settings` | Admin management — invite + remove |
| `404` | Not found |
| `session-expired` | Session timeout |
| `check-email` | Post forgot-password confirmation |

---

## V1 scope boundary — do not add

Per the PRD and client spec, the following are **Phase 2** and should not be built in V1:

- Tile click-through analytics pages
- Compliance export / reporting
- Role-based access tiers (AD vs NIL Coordinator)
- Literacy score tracking
- Advisor connection rates
- Bulk roster import
- FWW Super-Admin cross-school dashboard (separate product)

---

**Questions?** Reach out to Carol-Ann at Human Agency.
