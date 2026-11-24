-- Authenticated viewer accounts can read the approved company register sections only.
drop policy if exists employees_user_self_read on public.employees;
create policy employees_viewer_read on public.employees for select using (auth.uid() is not null);
drop policy if exists assets_user_own_read on public.assets;
create policy assets_viewer_read on public.assets for select using (auth.uid() is not null);
-- There are intentionally no viewer write policies, no software policy, and no maintenance policy.
notify pgrst, 'reload schema';
