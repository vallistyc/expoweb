-- Jalankan di Supabase SQL Editor. NIS unik ditegakkan langsung oleh primary key
-- pada tabel pemetaan_rumpun_ilmu agar satu siswa hanya dapat mengirim sekali.

create table if not exists public.opsi_kelas (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint opsi_kelas_label_nonempty check (length(trim(label)) between 1 and 40)
);

create table if not exists public.opsi_rumpun_ilmu (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint opsi_rumpun_label_nonempty check (length(trim(label)) between 1 and 100)
);

create unique index if not exists opsi_kelas_label_casefold_uq
  on public.opsi_kelas (lower(label));
create unique index if not exists opsi_rumpun_label_casefold_uq
  on public.opsi_rumpun_ilmu (lower(label));

insert into public.opsi_kelas (label, sort_order)
select 'XII F' || n, n from generate_series(1, 10) as n
on conflict (label) do nothing;

insert into public.opsi_rumpun_ilmu (label, sort_order) values
  ('Kesehatan dan Kedokteran', 1),
  ('Sains dan Matematika', 2),
  ('Teknik dan Teknologi', 3),
  ('Ekonomi dan Bisnis', 4),
  ('Sosial dan Humaniora', 5),
  ('Hukum dan Politik', 6),
  ('Pendidikan', 7),
  ('Seni dan Desain', 8),
  ('Pertanian dan Lingkungan', 9)
on conflict (label) do nothing;

create table if not exists public.pemetaan_rumpun_ilmu (
  nis text primary key,
  nama_lengkap text not null,
  kelas text not null,
  no_wa text not null,
  email text not null,
  pas_foto text,
  rumpun_ilmu_1 text not null,
  rumpun_ilmu_2 text not null,
  created_at timestamptz not null default now(),
  constraint pemetaan_nis_format check (nis ~ '^[0-9]{1,30}$'),
  constraint pemetaan_rumpun_berbeda check (rumpun_ilmu_1 <> rumpun_ilmu_2)
);

-- Tambahkan foreign key idempotently agar pilihan selalu berasal dari opsi admin.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'pemetaan_kelas_opsi_fk') then
    alter table public.pemetaan_rumpun_ilmu
      add constraint pemetaan_kelas_opsi_fk foreign key (kelas)
      references public.opsi_kelas(label) on update restrict on delete restrict not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pemetaan_rumpun_1_opsi_fk') then
    alter table public.pemetaan_rumpun_ilmu
      add constraint pemetaan_rumpun_1_opsi_fk foreign key (rumpun_ilmu_1)
      references public.opsi_rumpun_ilmu(label) on update restrict on delete restrict not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pemetaan_rumpun_2_opsi_fk') then
    alter table public.pemetaan_rumpun_ilmu
      add constraint pemetaan_rumpun_2_opsi_fk foreign key (rumpun_ilmu_2)
      references public.opsi_rumpun_ilmu(label) on update restrict on delete restrict not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pemetaan_nis_format') then
    alter table public.pemetaan_rumpun_ilmu
      add constraint pemetaan_nis_format check (nis ~ '^[0-9]{1,30}$') not valid;
  end if;
end $$;

create index if not exists pemetaan_created_at_idx
  on public.pemetaan_rumpun_ilmu (created_at desc);
create index if not exists pemetaan_kelas_idx
  on public.pemetaan_rumpun_ilmu (kelas);
create index if not exists pemetaan_rumpun_1_idx
  on public.pemetaan_rumpun_ilmu (rumpun_ilmu_1);
create index if not exists pemetaan_rumpun_2_idx
  on public.pemetaan_rumpun_ilmu (rumpun_ilmu_2);

create table if not exists public.admin_login_attempts (
  ip_key text primary key,
  attempts integer not null default 1,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  constraint admin_login_ip_key_length check (length(ip_key) = 64)
);

create or replace view public.pemetaan_rumpun_stats
with (security_invoker = true) as
select
  o.id,
  o.label,
  o.active,
  count(p.nis)::integer as total,
  count(p.nis) filter (where p.rumpun_ilmu_1 = o.label)::integer as pilihan_1,
  count(p.nis) filter (where p.rumpun_ilmu_2 = o.label)::integer as pilihan_2
from public.opsi_rumpun_ilmu o
left join public.pemetaan_rumpun_ilmu p
  on p.rumpun_ilmu_1 = o.label or p.rumpun_ilmu_2 = o.label
group by o.id, o.label, o.active;

alter table public.opsi_kelas enable row level security;
alter table public.opsi_rumpun_ilmu enable row level security;
alter table public.pemetaan_rumpun_ilmu enable row level security;
alter table public.admin_login_attempts enable row level security;

revoke all on public.opsi_kelas, public.opsi_rumpun_ilmu,
  public.pemetaan_rumpun_ilmu, public.admin_login_attempts,
  public.pemetaan_rumpun_stats from public, anon, authenticated;
grant all on public.opsi_kelas, public.opsi_rumpun_ilmu, public.pemetaan_rumpun_ilmu to service_role;
grant select on public.pemetaan_rumpun_stats to service_role;

create or replace function public.allow_admin_login_attempt(p_ip_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_time_utc timestamptz := clock_timestamp();
  blocked_until_utc timestamptz;
begin
  if p_ip_key is null or length(p_ip_key) <> 64 then
    return false;
  end if;

  insert into public.admin_login_attempts (ip_key, attempts, window_started_at, blocked_until)
  values (p_ip_key, 1, current_time_utc, null)
  on conflict (ip_key) do update set
    attempts = case
      when public.admin_login_attempts.blocked_until > current_time_utc then public.admin_login_attempts.attempts
      when public.admin_login_attempts.window_started_at <= current_time_utc - interval '15 minutes' then 1
      else public.admin_login_attempts.attempts + 1
    end,
    window_started_at = case
      when public.admin_login_attempts.blocked_until > current_time_utc then public.admin_login_attempts.window_started_at
      when public.admin_login_attempts.window_started_at <= current_time_utc - interval '15 minutes' then current_time_utc
      else public.admin_login_attempts.window_started_at
    end,
    blocked_until = case
      when public.admin_login_attempts.blocked_until > current_time_utc then public.admin_login_attempts.blocked_until
      when public.admin_login_attempts.window_started_at <= current_time_utc - interval '15 minutes' then null
      when public.admin_login_attempts.attempts + 1 >= 5 then current_time_utc + interval '15 minutes'
      else null
    end
  returning blocked_until into blocked_until_utc;

  delete from public.admin_login_attempts
  where window_started_at < current_time_utc - interval '1 day';

  return blocked_until_utc is null or blocked_until_utc <= current_time_utc;
end;
$$;

revoke all on function public.allow_admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.allow_admin_login_attempt(text) to service_role;
grant all on public.admin_login_attempts to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pas-foto-pemetaan', 'pas-foto-pemetaan', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
