-- Run this entire file in Supabase SQL Editor.
-- 1) Create posts table.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  narrative text,
  image_url text not null,
  category text default 'MOMENTS',
  created_at timestamptz not null default now()
);

-- 2) Admin allowlist. Only add your own Auth user UUID here.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.posts enable row level security;
alter table public.admin_users enable row level security;

-- Anyone can view published entries.
create policy "Public can read posts" on public.posts
  for select using (true);

-- Only allowlisted admin accounts can create, update or delete posts.
create policy "Admins can insert posts" on public.posts
  for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update posts" on public.posts
  for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete posts" on public.posts
  for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admin users can read only their own allowlist row.
create policy "Admins can read own row" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Create a PUBLIC bucket for visitor-readable image URLs.
insert into storage.buckets (id, name, public)
values ('journal-images', 'journal-images', true)
on conflict (id) do nothing;

create policy "Anyone can view journal images" on storage.objects
  for select using (bucket_id = 'journal-images');

create policy "Admins can upload journal images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'journal-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

create policy "Admins can delete journal images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'journal-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- After creating your user in Supabase Authentication, run this separately:
-- insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
