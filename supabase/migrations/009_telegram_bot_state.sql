-- Telegram bot: update offset storage + pg_cron poll of Edge Function `telegram-bot`.

create table if not exists public.telegram_bot_state (
  id smallint primary key check (id = 1),
  update_offset bigint not null default 0
);

insert into public.telegram_bot_state (id, update_offset) values (1, 0)
on conflict (id) do nothing;

alter table public.telegram_bot_state enable row level security;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'telegram-bot-poll'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end $$;

select cron.schedule(
  'telegram-bot-poll',
  '* * * * *',
  $$
  select net.http_get(
    url := 'https://nyjpgwydbdgnlynerucy.supabase.co/functions/v1/telegram-bot'
  ) as request_id;
  $$
);
