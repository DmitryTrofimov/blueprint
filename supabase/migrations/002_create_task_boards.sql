-- Task boards table (fully shared among authenticated users)
create table if not exists public.task_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_by_name text not null
);

alter table public.task_boards enable row level security;

create policy "Authenticated users can read task boards"
  on public.task_boards
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert task boards"
  on public.task_boards
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update task boards"
  on public.task_boards
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete task boards"
  on public.task_boards
  for delete
  to authenticated
  using (true);

create or replace function public.set_task_boards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists task_boards_set_updated_at on public.task_boards;

create trigger task_boards_set_updated_at
  before update on public.task_boards
  for each row
  execute function public.set_task_boards_updated_at();
