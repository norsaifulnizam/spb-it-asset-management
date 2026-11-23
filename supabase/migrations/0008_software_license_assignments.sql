create table if not exists public.software_license_assignments (
  id uuid primary key default gen_random_uuid(),
  software_license_id uuid not null references public.software_licenses(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  notes text,
  unique (software_license_id, employee_id)
);

create index if not exists software_license_assignments_employee_idx
  on public.software_license_assignments (employee_id);

alter table public.software_license_assignments enable row level security;

drop policy if exists "software_license_assignments_v1_read" on public.software_license_assignments;
create policy "software_license_assignments_v1_read"
  on public.software_license_assignments for select using (true);

drop policy if exists "software_license_assignments_v1_write" on public.software_license_assignments;
create policy "software_license_assignments_v1_write"
  on public.software_license_assignments for all using (true) with check (true);

notify pgrst, 'reload schema';
