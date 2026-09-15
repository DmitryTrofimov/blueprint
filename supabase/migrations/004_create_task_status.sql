-- Task status lookup table
create table if not exists public.task_status (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.task_status (name) values
  ('ToDo'),
  ('In Progress'),
  ('Blocked'),
  ('In Review'),
  ('Completed')
on conflict (name) do nothing;

alter table public.task_status enable row level security;

create policy "Authenticated users can read task status"
  on public.task_status
  for select
  to authenticated
  using (true);
