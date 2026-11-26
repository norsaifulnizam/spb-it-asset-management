create table if not exists public.software_renewals (
  id uuid primary key default gen_random_uuid(),
  software_license_id uuid not null references public.software_licenses(id) on delete cascade,
  renewed_on date not null,
  next_renewal_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists software_renewals_license_idx
  on public.software_renewals (software_license_id, renewed_on desc);

alter table public.software_renewals enable row level security;

drop policy if exists software_renewals_admin_all on public.software_renewals;
create policy software_renewals_admin_all
  on public.software_renewals for all
  using (public.is_asset_admin())
  with check (public.is_asset_admin());

notify pgrst, 'reload schema';
