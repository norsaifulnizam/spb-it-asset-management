create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  office_location text,
  created_at timestamptz not null default now(),
  unique (name, company)
);

insert into public.consultants (name, company)
select distinct trim(consultant_name), coalesce(trim(consultant_company), '')
from public.assets
where assignment_kind = 'consultant'
  and nullif(trim(consultant_name), '') is not null
on conflict (name, company) do nothing;

create table if not exists public.software_consultant_assignments (
  id uuid primary key default gen_random_uuid(),
  software_license_id uuid not null references public.software_licenses(id) on delete cascade,
  consultant_id uuid not null references public.consultants(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  notes text,
  unique (software_license_id, consultant_id)
);

alter table public.consultants enable row level security;

alter table public.software_consultant_assignments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'consultants' and policyname = 'consultants_admin_all') then
    create policy consultants_admin_all on public.consultants for all using (public.is_asset_admin()) with check (public.is_asset_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'consultants' and policyname = 'consultants_authenticated_read') then
    create policy consultants_authenticated_read on public.consultants for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'software_consultant_assignments' and policyname = 'software_consultant_assignments_admin_all') then
    create policy software_consultant_assignments_admin_all on public.software_consultant_assignments for all using (public.is_asset_admin()) with check (public.is_asset_admin());
  end if;
end $$;

notify pgrst, 'reload schema';
