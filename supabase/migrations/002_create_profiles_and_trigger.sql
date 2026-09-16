-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  role_id uuid references public.roles (id) on delete set null,
  telegram_username text,
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_telegram_username_format;

alter table public.profiles add constraint profiles_telegram_username_format check (
  telegram_username is null
  or (
    char_length(trim(telegram_username)) between 5 and 32
    and trim(telegram_username) ~ '^[A-Za-z0-9_]+$'
  )
);

create unique index if not exists profiles_telegram_username_unique_idx
  on public.profiles (lower(trim(telegram_username)))
  where telegram_username is not null and trim(telegram_username) <> '';

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Auto-create profile on signup (username + role from user metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role_name text;
  selected_role_id uuid;
  auth_provider text;
begin
  selected_role_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'role', '')), '');
  auth_provider := coalesce(new.raw_app_meta_data ->> 'provider', '');

  if selected_role_name is not null then
    select id into selected_role_id from public.roles where name = selected_role_name;
  elsif auth_provider = 'google' then
    select id into selected_role_id from public.roles where name = 'Reviewer';
  end if;

  insert into public.profiles (id, username, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', ''),
    selected_role_id
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
