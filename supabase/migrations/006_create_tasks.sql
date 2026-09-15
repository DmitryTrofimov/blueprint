-- Tasks on boards
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status_id uuid not null references public.task_status (id),
  priority_id uuid references public.task_priority (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_by_name text not null default '',
  assigned_to uuid references auth.users (id) on delete set null,
  constraint tasks_title_length check (char_length(title) <= 80),
  constraint tasks_description_length check (char_length(description) <= 220)
);

create or replace function public.tasks_tags_valid(tags text[])
returns boolean
language sql
immutable
as $$
  select coalesce(array_length(tags, 1), 0) <= 10
    and not exists (
      select 1
      from unnest(tags) as t (tag)
      where char_length(trim(tag)) = 0
        or char_length(trim(tag)) > 30
    );
$$;

alter table public.tasks
  add constraint tasks_tags_valid check (public.tasks_tags_valid(tags));

create index if not exists tasks_board_id_idx on public.tasks (board_id);
create index if not exists tasks_status_id_idx on public.tasks (status_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);

alter table public.tasks enable row level security;

create policy "Authenticated users can read tasks"
  on public.tasks
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tasks"
  on public.tasks
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tasks"
  on public.tasks
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete tasks"
  on public.tasks
  for delete
  to authenticated
  using (true);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_tasks_updated_at();
