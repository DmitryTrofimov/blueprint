-- Task priority lookup table
create table if not exists public.task_priority (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.task_priority (name) values
  ('Urgent'),
  ('High'),
  ('Average'),
  ('Low')
on conflict (name) do nothing;

alter table public.task_priority enable row level security;

create policy "Authenticated users can read task priority"
  on public.task_priority
  for select
  to authenticated
  using (true);
