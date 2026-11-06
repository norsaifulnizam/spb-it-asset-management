# Data Model

## assets
| Field | Type |
|---|---|
| id | uuid pk |
| user_id | uuid (nullable, for owner-scoping later) |
| asset_tag | text unique not null |
| asset_type | text not null (laptop/monitor/phone/accessory/software) |
| brand_model | text not null |
| serial_number | text |
| purchase_date | date |
| warranty_expiry | date |
| condition | text default 'good' (good/fair/poor/defective) |
| location | text |
| assigned_employee_id | uuid → employees.id (nullable) |
| status | text not null default 'available' (available/assigned/under_repair/retired) |
| notes | text |
| created_at | timestamptz default now() |

**RLS:** v1 permissive (read/write open). Lock-down: `auth.uid() = user_id`.

## employees
| Field | Type |
|---|---|
| id | uuid pk |
| user_id | uuid (nullable) |
| name | text not null |
| department | text |
| email | text |
| created_at | timestamptz default now() |

**RLS:** v1 permissive. Lock-down: all authenticated users can read; only IT staff can write.

## maintenance_logs
| Field | Type |
|---|---|
| id | uuid pk |
| user_id | uuid (nullable) |
| asset_id | uuid → assets.id (cascade) |
| log_type | text not null (repair/maintenance/return) |
| description | text |
| logged_date | date default current_date |
| created_at | timestamptz default now() |

**RLS:** v1 permissive. Lock-down: owner-scoped.

## AI fields (later)
If AI auto-categorises asset type from free-text, store: `ai_asset_type` (value), `ai_asset_type_source` (text), `ai_asset_type_confidence` (numeric), `ai_asset_type_review_status` (text default 'unreviewed').

## Secondary tables (later)
audit_logs, teams, software_licenses — deferred.