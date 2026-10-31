-- AQP Beauty Studio: run this once in Supabase (SQL Editor -> New query -> paste -> Run).
-- Row-level security is on and there are no public policies, so only the website's server
-- (using the service-role key) can read or write. Visitors never touch these tables directly.

create table if not exists services (
  id       text primary key,
  grp      text not null check (grp in ('Hair', 'Nails', 'Brows, lashes & waxing')),
  name     text not null,
  variant  text,
  price    integer not null check (price >= 0),
  sort     integer not null default 0,
  active   boolean not null default true
);

create table if not exists settings (
  key   text primary key,
  value jsonb not null
);

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'pending' check (status in ('pending', 'confirmed', 'done', 'cancelled')),
  name          text not null,
  phone         text not null,
  email         text,
  note          text,
  home_service  boolean not null default false,
  service_ids   text[] not null,
  service_names text[] not null,
  total         integer not null,
  date          date not null,
  time          text not null
);

create index if not exists bookings_date_idx on bookings (date, time);

alter table services enable row level security;
alter table settings enable row level security;
alter table bookings enable row level security;
