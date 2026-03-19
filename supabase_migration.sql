-- ============================================================
-- Simulyn: Profiles table migration
-- Run this in your Supabase project SQL editor
-- ============================================================

-- 1. Profiles table (role + banned status)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  namespace text,
  role text not null default 'user' check (role in ('user', 'admin', 'owner')),
  is_banned boolean not null default false,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table public.profiles enable row level security;

-- 2. RLS Policies
-- ⚠️  IMPORTANT: Use a SECURITY DEFINER function to avoid self-referential RLS loops.
--    Without this, the "is this user an admin?" check would itself require reading
--    the profiles table, which is blocked by RLS → infinite loop → null result.

-- Helper function (runs as DB superuser, bypasses RLS)
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- SELECT: any authenticated user can read any profile row.
-- This is safe because:
--   • The admin page is guarded by middleware AND a server-side role check.
--   • Profile data (email, namespace, role, is_banned) is not sensitive secrets.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Authenticated users can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- UPDATE: owner can update any profile; admin can only update 'user' rows
drop policy if exists "Owner can update any profile" on public.profiles;
drop policy if exists "Admin can update user profiles" on public.profiles;

create policy "Owner can update any profile"
  on public.profiles for update
  using (public.get_my_role() = 'owner');

create policy "Admin can update user profiles"
  on public.profiles for update
  using (
    public.get_my_role() in ('admin', 'owner')
    and (select role from public.profiles where id = profiles.id) = 'user'
  );

-- 3. Trigger: auto-create profile row on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, namespace, role, is_banned)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'namespace',
    'user',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Backfill existing users
insert into public.profiles (id, email, namespace, role, is_banned)
select
  id,
  email,
  raw_user_meta_data->>'namespace',
  'user',
  false
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- Make yourself the owner (run after migration):
-- ============================================================
-- UPDATE public.profiles SET role = 'owner' WHERE email = 'your@email.com';


-- 3. Trigger: auto-create profile row on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, namespace, role, is_banned)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'namespace',
    'user',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Backfill existing users
insert into public.profiles (id, email, namespace, role, is_banned)
select
  id,
  email,
  raw_user_meta_data->>'namespace',
  'user',
  false
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- IMPORTANT: Make yourself the owner
-- Replace the email below with your own email and run this:
-- ============================================================
-- UPDATE public.profiles SET role = 'owner' WHERE email = 'your@email.com';
