-- MunifApps database
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  file_name text,
  output_name text,
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Users can view own jobs"
on public.jobs for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own jobs"
on public.jobs for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete own jobs"
on public.jobs for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('munifapps', 'munifapps', false)
on conflict (id) do nothing;

create policy "Users upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'munifapps'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users read own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'munifapps'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'munifapps'
  and (storage.foldername(name))[1] = auth.uid()::text
);
