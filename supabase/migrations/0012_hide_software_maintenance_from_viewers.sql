-- Software and maintenance are Admin-only; viewer accounts must not read them.
drop policy if exists maintenance_viewer_read on public.maintenance_logs;
drop policy if exists software_viewer_read on public.software_licenses;
drop policy if exists software_assignment_viewer_read on public.software_license_assignments;
drop policy if exists server_details_viewer_read on public.server_details;
notify pgrst, 'reload schema';
