# Security

## Secret Handling
- Supabase keys in env vars only (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Service role key NEVER exposed to frontend — server-side only.
- No secrets in client bundles or git.

## Permission Model
- **v1 (demo-first):** Permissive RLS — anonymous visitors can read/write seeded data. No login wall.
- **Lock-down (later):**
  - IT admins: full CRUD on assets, employees, maintenance logs.
  - Department admins: read-only on assets + employees.
  - Standard users: no access.
  - RLS: `auth.uid() = user_id` for owner-scoped writes; role check for department admins.

## Approved Tools Rule
Agent (later) may only call named tools (`parse_asset_description`, `score_asset_attention`, `summarise_maintenance_history`). No raw SQL execution or arbitrary API calls from AI.

## Audit Principle
Every asset status change and assignment recorded in `maintenance_logs` with actor + timestamp. Later: dedicated `audit_logs` table for all mutations.