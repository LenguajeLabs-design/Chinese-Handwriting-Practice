# Supabase Sync Setup

This app can back up study progress to Supabase so the same learner can restore it on another iPad or computer.

## Frontend environment variables

Add these variables where the app is hosted:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

For local development, place them in a `.env.local` file inside:

`artifacts/hanzi-practice-desk/`

## Auth setup

Enable Supabase Auth with email sign-in.

Recommended provider:

- Email magic links

Recommended redirect URLs:

- `http://localhost:5173`
- `https://lenguajelabs-design.github.io/Chinese-Handwriting-Practice/`

If you use additional preview environments, add those too.

## Database table

Run this SQL in Supabase:

```sql
create table if not exists public.hanzi_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.hanzi_progress_snapshots enable row level security;

create policy "Users can read their own snapshot"
on public.hanzi_progress_snapshots
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own snapshot"
on public.hanzi_progress_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own snapshot"
on public.hanzi_progress_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## How the app behaves

- Progress still lives locally first, so the app works offline.
- Once a user signs in and taps **Back Up This Device**, auto-backup is enabled on that device.
- A second device can sign in and choose **Restore Cloud Progress**.
- The app intentionally avoids silent restore so a new device does not overwrite a stronger cloud backup by accident.
