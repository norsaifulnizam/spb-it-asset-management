alter table assets add column if not exists assignment_kind text not null default 'internal';
alter table assets add column if not exists consultant_name text;
alter table assets add column if not exists consultant_company text;
