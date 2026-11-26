alter table if exists public.software_licenses
  add column if not exists payment_method text not null default 'vendor_invoice',
  add column if not exists payment_reference text;

alter table if exists public.software_licenses
  drop constraint if exists software_licenses_payment_method_check;

alter table if exists public.software_licenses
  add constraint software_licenses_payment_method_check
  check (payment_method in ('vendor_invoice', 'credit_card', 'other'));

notify pgrst, 'reload schema';
