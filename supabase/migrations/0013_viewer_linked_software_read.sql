-- Software stays hidden from the viewer navigation. Viewers receive only
-- the name and type of software already linked to an employee profile.
create or replace function public.get_viewer_employee_software()
returns table (
  assignment_id uuid,
  employee_id uuid,
  software_license_id uuid,
  assigned_at timestamptz,
  product_name text,
  company text,
  license_type text
)
language sql
security definer
set search_path = public
as $$
  select a.id, a.employee_id, s.id, a.assigned_at, s.product_name, s.company, s.license_type
  from public.software_license_assignments a
  join public.software_licenses s on s.id = a.software_license_id
  where auth.uid() is not null;
$$;

revoke all on function public.get_viewer_employee_software() from public;
grant execute on function public.get_viewer_employee_software() to authenticated;

notify pgrst, 'reload schema';
