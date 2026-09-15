-- Assignable users directory (synced from profiles)
create table if not exists public.user_directory (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  role_name text not null default ''
);

alter table public.user_directory enable row level security;

create policy "Authenticated users can read user directory"
  on public.user_directory
  for select
  to authenticated
  using (true);

create or replace function public.sync_user_directory_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_label text;
begin
  if tg_op = 'DELETE' then
    delete from public.user_directory where user_id = old.id;
    return old;
  end if;

  select coalesce(r.name, '') into role_label
  from public.roles r
  where r.id = new.role_id;

  insert into public.user_directory (user_id, username, role_name)
  values (new.id, new.username, role_label)
  on conflict (user_id) do update
  set username = excluded.username,
      role_name = excluded.role_name;

  return new;
end;
$$;

drop trigger if exists profiles_sync_user_directory on public.profiles;

create trigger profiles_sync_user_directory
  after insert or update or delete on public.profiles
  for each row
  execute function public.sync_user_directory_from_profile();

insert into public.user_directory (user_id, username, role_name)
select p.id, p.username, coalesce(r.name, '')
from public.profiles p
left join public.roles r on r.id = p.role_id
on conflict (user_id) do update
set username = excluded.username,
    role_name = excluded.role_name;
