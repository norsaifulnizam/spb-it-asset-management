create table if not exists server_details (
  asset_id uuid primary key references assets(id) on delete cascade,
  hostname text,
  ip_address text,
  operating_system text,
  server_role text,
  environment text,
  rack_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table server_details enable row level security;
drop policy if exists "server_details_v1_read" on server_details;
create policy "server_details_v1_read" on server_details for select using (true);
drop policy if exists "server_details_v1_write" on server_details;
create policy "server_details_v1_write" on server_details for all using (true) with check (true);
