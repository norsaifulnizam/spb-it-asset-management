-- Viewer accounts can see the same operational registers, without any write access.
drop policy if exists maintenance_viewer_read on public.maintenance_logs;
drop policy if exists software_viewer_read on public.software_licenses;
drop policy if exists software_assignment_viewer_read on public.software_license_assignments;
drop policy if exists server_details_viewer_read on public.server_details;
create policy maintenance_viewer_read on public.maintenance_logs for select using (auth.uid() is not null);
create policy software_viewer_read on public.software_licenses for select using (auth.uid() is not null);
create policy software_assignment_viewer_read on public.software_license_assignments for select using (auth.uid() is not null);
create policy server_details_viewer_read on public.server_details for select using (auth.uid() is not null);
notify pgrst, 'reload schema';
