-- ─── UniEvents Schema ─────────────────────────────────────────────────────────
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. profiles (extends auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text        not null,
  role       text        not null check (role in ('student', 'organiser')),
  email      text        not null,
  created_at timestamptz not null default now()
);

-- 2. events
create table if not exists public.events (
  id             uuid        primary key default gen_random_uuid(),
  title          text        not null,
  description    text        not null,
  date           date        not null,
  time           time        not null,
  location       text        not null,
  category       text        not null check (category in ('academic','social','career','workshop')),
  capacity       int         not null,
  organiser_name text        not null,
  organiser_id   uuid        not null references public.profiles(id),
  created_at     timestamptz not null default now()
);

-- 3. registrations
create table if not exists public.registrations (
  id            uuid        primary key default gen_random_uuid(),
  event_id      uuid        not null references public.events(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  status        text        not null check (status in ('registered','waitlisted','cancelled')),
  checked_in    boolean     not null default false,
  checked_in_at timestamptz,
  created_at    timestamptz not null default now(),
  unique(event_id, user_id)
);

-- 4. email_log
create table if not exists public.email_log (
  id         uuid        primary key default gen_random_uuid(),
  icon       text,
  subject    text        not null,
  recipient  text        not null,
  status     text        not null check (status in ('sent','pending','failed')),
  created_at timestamptz not null default now()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.events       enable row level security;
alter table public.registrations enable row level security;
alter table public.email_log    enable row level security;

-- profiles: anyone authenticated can read; users manage their own
create policy "profiles_select" on public.profiles for select using (auth.uid() is not null);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- events: read for all authed; insert for organisers only
create policy "events_select" on public.events for select using (auth.uid() is not null);
create policy "events_insert" on public.events for insert with check (auth.uid() = organiser_id);

-- registrations: read for all authed; write for the owning user or event organiser
create policy "registrations_select" on public.registrations for select using (auth.uid() is not null);
create policy "registrations_insert" on public.registrations for insert with check (auth.uid() = user_id);
create policy "registrations_update" on public.registrations for update
  using (
    auth.uid() = user_id
    or exists (select 1 from public.events where id = event_id and organiser_id = auth.uid())
  );

-- email_log: authenticated users can insert and read their own entries
create policy "email_log_insert" on public.email_log for insert with check (auth.uid() is not null);
create policy "email_log_select" on public.email_log for select using (auth.uid() is not null);

-- ─── Auto-create profile on sign-up ────────────────────────────────────────
-- (optional helper trigger — store role via user metadata at sign-up)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
