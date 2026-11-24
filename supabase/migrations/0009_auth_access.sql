-- Login roles for the production asset register.
create table if not exists public.asset_app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id uuid unique references public.employees(id) on delete set null,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.asset_app_users enable row level security;

create or replace function public.is_asset_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.asset_app_users where id = auth.uid() and role = 'admin' and is_active);
$$;

create or replace function public.current_asset_employee_id()
returns uuid language sql stable security definer set search_path = public as $$
  select employee_id from public.asset_app_users where id = auth.uid() and is_active;
$$;

create or replace function public.create_asset_app_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.asset_app_users (id, employee_id, role)
  values (
    new.id,
    (select id from public.employees where lower(email) = lower(new.email) limit 1),
    case when lower(new.email) = 'norsaifulnizam@selangorproperties.com.my' then 'admin' else 'user' end
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_asset_app_user on auth.users;
create trigger on_auth_user_created_asset_app_user
  after insert on auth.users for each row execute procedure public.create_asset_app_user();

-- Existing users (if any) are enrolled as standard users. The named SPB IT email becomes Admin.
insert into public.asset_app_users (id, employee_id, role)
select u.id, (select e.id from public.employees e where lower(e.email) = lower(u.email) limit 1),
  case when lower(u.email) = 'norsaifulnizam@selangorproperties.com.my' then 'admin' else 'user' end
from auth.users u on conflict (id) do nothing;

drop policy if exists asset_app_users_self_read on public.asset_app_users;
create policy asset_app_users_self_read on public.asset_app_users for select using (id = auth.uid() or public.is_asset_admin());
drop policy if exists asset_app_users_admin_write on public.asset_app_users;
create policy asset_app_users_admin_write on public.asset_app_users for all using (public.is_asset_admin()) with check (public.is_asset_admin());

-- Remove the old demo-open policies.
drop policy if exists employees_v1_read on public.employees; drop policy if exists employees_v1_write on public.employees;
drop policy if exists assets_v1_read on public.assets; drop policy if exists assets_v1_write on public.assets;
drop policy if exists maintenance_logs_v1_read on public.maintenance_logs; drop policy if exists maintenance_logs_v1_write on public.maintenance_logs;
drop policy if exists software_licenses_v1_read on public.software_licenses; drop policy if exists software_licenses_v1_write on public.software_licenses;
drop policy if exists software_license_assignments_v1_read on public.software_license_assignments; drop policy if exists software_license_assignments_v1_write on public.software_license_assignments;

create policy employees_admin_all on public.employees for all using (public.is_asset_admin()) with check (public.is_asset_admin());
create policy employees_user_self_read on public.employees for select using (id = public.current_asset_employee_id());
create policy assets_admin_all on public.assets for all using (public.is_asset_admin()) with check (public.is_asset_admin());
create policy assets_user_own_read on public.assets for select using (assigned_employee_id = public.current_asset_employee_id());
create policy maintenance_admin_all on public.maintenance_logs for all using (public.is_asset_admin()) with check (public.is_asset_admin());
create policy software_admin_all on public.software_licenses for all using (public.is_asset_admin()) with check (public.is_asset_admin());
create policy software_user_assigned_read on public.software_licenses for select using (exists (select 1 from public.software_license_assignments a where a.software_license_id = id and a.employee_id = public.current_asset_employee_id()));
create policy software_assignment_admin_all on public.software_license_assignments for all using (public.is_asset_admin()) with check (public.is_asset_admin());
create policy software_assignment_user_own_read on public.software_license_assignments for select using (employee_id = public.current_asset_employee_id());

notify pgrst, 'reload schema';
