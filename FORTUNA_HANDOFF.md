# FWW Admin Dashboard — Fortuna Handoff Brief
**Prepared by Human Agency · Target deploy: May 1, 2026**

Hey Fortuna — this is the complete Next.js codebase for the FWW school admin dashboard. It's fully built. Your job is to wire it to Supabase, drop in the env vars, and deploy to Vercel. Should be a short lift.

---

## What's Built

| Page | Route | Status |
|---|---|---|
| Login + forgot password | `/login` | ✅ Done |
| Main dashboard (all stat cards) | `/dashboard` | ✅ Done |
| Athletes table (search + filter) | `/athletes` | ✅ Done |
| Athlete detail + module progress | `/athletes/[id]` | ✅ Done |
| Settings + invite/remove admin | `/settings` | ✅ Done |

All auth, routing, and data fetching is wired up. The only things missing are the env vars and the Supabase table confirmation below.

---

## Step 1 — Get Your Keys

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase → Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase → Project Settings → API → anon / public key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase → Project Settings → API → service_role key (secret!)
NEXT_PUBLIC_APP_URL=               # https://your-vercel-domain.vercel.app
```

⚠️ **Never commit `.env.local`** — it's in `.gitignore`. Add `SUPABASE_SERVICE_ROLE_KEY` as a Vercel Environment Variable in the dashboard (not public).

---

## Step 2 — Confirm Supabase Table Schema

The queries in `lib/queries.ts` assume these table names. **Verify they match what Joel built** or update the names in `queries.ts` accordingly.

| Table | Expected columns |
|---|---|
| `admin_users` | `id` (uuid, matches auth.users.id), `email`, `school_id` (uuid), `created_at` |
| `schools` | `id` (uuid), `name` |
| `athletes` | `id`, `school_id`, `name`, `sport`, `invited_at`, `activated_at` (nullable) |
| `modules` | `id`, `name`, `order_index` (int) |
| `module_completions` | `id`, `athlete_id`, `module_id`, `status` ('not_started'\|'in_progress'\|'completed'), `updated_at` |
| `app_sessions` | `id`, `athlete_id`, `started_at` (timestamptz), `ended_at`, `duration_seconds` (int) |
| `budgets` | `id`, `athlete_id`, `created_at` |

If table/column names differ, update them in `/lib/queries.ts` — all queries are in that one file, easy to find with Cmd+F.

---

## Step 3 — Supabase RLS (Row Level Security)

Each admin must only see their school's data. RLS policies need to be in place on all tables. Recommended approach:

1. All authenticated users in `admin_users` have a `school_id`.
2. Add a RLS policy on `athletes`, `app_sessions`, `module_completions`, `budgets`:

```sql
-- Example for athletes table
CREATE POLICY "Admins see own school athletes" ON athletes
  FOR SELECT USING (
    school_id = (
      SELECT school_id FROM admin_users WHERE id = auth.uid()
    )
  );
```

Apply equivalent policies to all tables. Without this, an admin could technically query another school's data.

---

## Step 4 — Brand Tokens (one file to update)

Open `tailwind.config.ts` and `app/globals.css`. There are two `⚠️` comments marking the placeholder green hex (`#1A6B3C`).

Replace with the exact FWW hero green from the design system. Ask Cait for the hex if you don't have it. Update both:

```css
/* app/globals.css */
--fww-green: #YOUR_HEX_HERE;
--fww-green-light: #lighter_version;
--fww-green-dark: #darker_version;
```

```ts
// tailwind.config.ts
fww: {
  green: "#YOUR_HEX_HERE",
  ...
}
```

Also replace the placeholder logo (the `FW` text square in `NavBar.tsx` and `login/page.tsx`) with a proper `<Image>` tag once Cait provides the logo asset. Drop the file in `/public/fww-logo.svg` (or .png) and update both components.

---

## Step 5 — Local Dev

```bash
# Install dependencies
npm install

# Copy and fill env
cp .env.local.example .env.local
# (edit .env.local with real values)

# Run dev server
npm run dev
# → http://localhost:3000
```

First run will redirect to `/login`. Log in with any Supabase admin_users credentials.

---

## Step 6 — Deploy to Vercel

```bash
# If you don't have Vercel CLI:
npm i -g vercel

# From the project root:
vercel

# Follow prompts — link to a new project, auto-detects Next.js
# Then in Vercel dashboard → Settings → Environment Variables, add all 4 env vars
# Set NEXT_PUBLIC_APP_URL to your final Vercel domain

# Deploy production:
vercel --prod
```

Or just connect the GitHub repo in the Vercel dashboard and it'll auto-deploy on push to `main`.

---

## Step 7 — Create the First Admin User

The first admin won't have a way to log in until you seed one. In Supabase dashboard:

1. Go to **Authentication → Users → Add User** — add the first school admin's email + temp password
2. Go to **Table Editor → admin_users** → insert a row: set `id` = the user's auth UUID, `email`, and `school_id` = the correct school's UUID
3. The admin logs in, then can invite up to 4 more from the Settings page

---

## What's NOT Built (Phase 2)

These are deliberately out of scope for May 1:

- Role-based access / permissions
- CSV / compliance data export
- Bulk roster upload
- Trend charts / literacy score over time
- Analytics instrumentation (separate task — tool TBD by Q&T)

---

## Questions?

Talk to Carol-Ann. She has the full PRD, the Asana board, and Joel D'Souza's contact for any Supabase schema questions.

Good luck — you've got this. 🤙
