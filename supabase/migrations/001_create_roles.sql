-- Roles lookup table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.roles (name) values
  ('Backend Developer'),
  ('DevOps Engineer'),
  ('Frontend Developer'),
  ('Manager'),
  ('QA Engineer'),
  ('Reviewer'),
  ('UI/UX')
on conflict (name) do nothing;

alter table public.roles enable row level security;

create policy "Authenticated users can read roles"
  on public.roles
  for select
  to authenticated
  using (true);
