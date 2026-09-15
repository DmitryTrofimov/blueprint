-- Tasks on boards (tags, optional deadline, progress included)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status_id uuid not null references public.board_statuses (id),
  priority_id uuid references public.task_priority (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_by_name text not null default '',
  assigned_to uuid references auth.users (id) on delete set null,
  deadline date,
  progress integer not null default 0,
  constraint tasks_title_length check (char_length(title) <= 80),
  constraint tasks_description_length check (char_length(description) <= 220),
  constraint tasks_deadline_not_past check (deadline is null or deadline >= current_date),
  constraint tasks_progress_range check (progress >= 0 and progress <= 100),
  constraint tasks_progress_step check (progress % 5 = 0)
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

-- Column invariants (requires tasks table; applied after tasks exist)
create or replace function public.board_statuses_guard_todo()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' and old.is_todo then
    raise exception 'Cannot delete the ToDo column';
  end if;

  if tg_op = 'UPDATE' and old.is_todo and new.position is distinct from old.position then
    raise exception 'Cannot move the ToDo column';
  end if;

  if tg_op = 'DELETE' then
    if exists (select 1 from public.tasks t where t.status_id = old.id) then
      raise exception 'Cannot delete a column that contains tasks';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists board_statuses_guard_todo on public.board_statuses;

create trigger board_statuses_guard_todo
  before update or delete on public.board_statuses
  for each row
  execute function public.board_statuses_guard_todo();
