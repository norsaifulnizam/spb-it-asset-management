alter table if exists public.software_licenses
  add column if not exists company text not null default 'SPB';

create index if not exists software_licenses_company_idx
  on public.software_licenses (company);

notify pgrst, 'reload schema';
