-- Per-board kanban columns (statuses), seeded from task_status templates on board create

create table if not exists public.board_statuses (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  position integer not null,
  is_todo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_statuses_position_nonneg check (position >= 0),
  constraint board_statuses_name_length check (char_length(trim(name)) between 1 and 40),
  constraint board_statuses_board_position unique (board_id, position)
);

create unique index if not exists board_statuses_board_name_lower_idx
  on public.board_statuses (board_id, lower(trim(name)));

create unique index if not exists board_statuses_one_todo_per_board_idx
  on public.board_statuses (board_id)
  where is_todo = true;

create index if not exists board_statuses_board_id_idx on public.board_statuses (board_id);

alter table public.board_statuses enable row level security;

create policy "Authenticated users can read board statuses"
  on public.board_statuses
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert board statuses"
  on public.board_statuses
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update board statuses"
  on public.board_statuses
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete board statuses"
  on public.board_statuses
  for delete
  to authenticated
  using (true);

create or replace function public.set_board_statuses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists board_statuses_set_updated_at on public.board_statuses;

create trigger board_statuses_set_updated_at
  before update on public.board_statuses
  for each row
  execute function public.set_board_statuses_updated_at();

create or replace function public.seed_board_default_statuses(p_board_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.board_statuses where board_id = p_board_id) then
    return;
  end if;

  insert into public.board_statuses (board_id, name, position, is_todo)
  select
    p_board_id,
    ts.name,
    row_number() over (
      order by
        case ts.name
          when 'ToDo' then 0
          when 'In Progress' then 1
          when 'Blocked' then 2
          when 'In Review' then 3
          when 'Completed' then 4
          else 99
        end
    ) - 1,
    ts.name = 'ToDo'
  from public.task_status ts;
end;
$$;

create or replace function public.boards_seed_default_statuses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_board_default_statuses(new.id);
  return new;
end;
$$;

drop trigger if exists boards_seed_default_statuses on public.boards;

create trigger boards_seed_default_statuses
  after insert on public.boards
  for each row
  execute function public.boards_seed_default_statuses();

-- Seed columns for boards created before this migration (e.g. existing rows in 003)
do $$
declare
  b record;
begin
  for b in select id from public.boards loop
    perform public.seed_board_default_statuses(b.id);
  end loop;
end;
$$;
