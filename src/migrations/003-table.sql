create table public.tables (
  id serial not null,
  name text,
  description text,
  capacity numeric,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

alter table public.tables enable row level security;

create policy "tables_select" on public.tables
  for select to authenticated using (true);

create policy "tables_write" on public.tables
  for all to authenticated using (true) with check (true);