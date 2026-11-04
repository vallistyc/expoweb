-- Jalankan di Supabase SQL Editor.
-- Kebutuhan halaman lembaga:
--   id_lembaga : identifier unik untuk React key dan URL/detail.
--   nama_lembaga, jenis, uraian : informasi yang ditampilkan kepada pengunjung.
--   logo       : URL/path gambar logo yang dibaca oleh komponen LogoLembaga.
--   aktif      : menyembunyikan data tanpa menghapus riwayatnya.
--   urutan     : mengatur urutan marquee dan halaman daftar.

create schema if not exists expoweb;

create table if not exists expoweb.lembaga (
  id_lembaga uuid primary key default gen_random_uuid(),
  nama_lembaga text not null,
  jenis text not null,
  logo text not null,
  uraian text not null default '',
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lembaga_nama_nonempty
    check (length(trim(nama_lembaga)) between 1 and 150),
  constraint lembaga_jenis_nonempty
    check (length(trim(jenis)) between 1 and 80),
  constraint lembaga_logo_nonempty
    check (length(trim(logo)) between 1 and 2048),
  constraint lembaga_uraian_length
    check (length(uraian) <= 5000),
  constraint lembaga_urutan_nonnegative
    check (urutan >= 0)
);

create unique index if not exists lembaga_nama_casefold_uq
  on expoweb.lembaga (lower(trim(nama_lembaga)));

create index if not exists lembaga_publik_order_idx
  on expoweb.lembaga (urutan, lower(nama_lembaga))
  where aktif;

create or replace function expoweb.set_lembaga_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lembaga_set_updated_at on expoweb.lembaga;
create trigger lembaga_set_updated_at
before update on expoweb.lembaga
for each row execute function expoweb.set_lembaga_updated_at();

alter table expoweb.lembaga enable row level security;

revoke all on schema expoweb from public, anon, authenticated;
revoke all on expoweb.lembaga from public, anon, authenticated;
grant usage on schema expoweb to service_role;
grant select, insert, update, delete on expoweb.lembaga to service_role;
grant execute on function expoweb.set_lembaga_updated_at() to service_role;

