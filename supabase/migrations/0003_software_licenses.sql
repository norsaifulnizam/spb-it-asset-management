create table if not exists software_licenses (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  vendor text,
  license_type text not null default 'subscription',
  total_seats integer not null default 1 check (total_seats >= 0),
  assigned_seats integer not null default 0 check (assigned_seats >= 0),
  renewal_date date,
  annual_cost numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  constraint software_licenses_assigned_seats_check check (assigned_seats <= total_seats)
);

alter table software_licenses enable row level security;
drop policy if exists "software_licenses_v1_read" on software_licenses;
create policy "software_licenses_v1_read" on software_licenses for select using (true);
drop policy if exists "software_licenses_v1_write" on software_licenses;
create policy "software_licenses_v1_write" on software_licenses for all using (true) with check (true);

insert into software_licenses (product_name, vendor, license_type, total_seats, assigned_seats, renewal_date, annual_cost, notes)
select 'Microsoft 365 Business Standard', 'Microsoft', 'subscription', 50, 0, null, null, 'Add the renewal date and seat allocation when confirmed.'
where not exists (select 1 from software_licenses where product_name = 'Microsoft 365 Business Standard');

insert into software_licenses (product_name, vendor, license_type, total_seats, assigned_seats, renewal_date, annual_cost, notes)
select 'Adobe Creative Cloud', 'Adobe', 'subscription', 10, 0, null, null, 'Add the renewal date and seat allocation when confirmed.'
where not exists (select 1 from software_licenses where product_name = 'Adobe Creative Cloud');
