# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + RLS) + Vercel.

## Build Sequence
- **Now:** Asset CRUD, assignment/return/repair workflow, dashboard, search/filter — viewable without login.
- **Next:** Warranty/return follow-up flags, department admin read views.
- **Later:** Auth + per-user RLS, barcode scanning, email reminders, reports.

## Key User Action Flow (Register → Assign → Repair → Return)
1. IT staff opens **Assets** page, clicks **Register Asset**.
2. Fills tag, type, model, serial, purchase/warranty dates, condition, location → saved to `assets`.
3. Opens asset detail → selects employee → status becomes `assigned`.
4. Later: clicks **Send for Repair** → status `under_repair`, maintenance log auto-created.
5. On return: clicks **Mark Available** → status `available`, employee cleared.

## Responsive Nav Shell
Persistent left sidebar on desktop (Assets, Dashboard, Employees, Maintenance Logs); collapses to hamburger on mobile. Current section highlighted.

## Layer Plan
1. **Data layer** (`lib/data/`) — all DB reads/writes via Supabase client.
2. **App logic** (server actions in `actions/`) — assignment, return, repair transitions.
3. **Smart features** (`lib/ai/`) — later: auto-categorise assets from free-text descriptions.

Core runs fully without any AI — every workflow is direct DB writes.

## Repo Structure
```
app/(routes)/assets, /dashboard, /employees, /maintenance
components/asset, /employee, /maintenance, /ui
lib/data/assets.ts, employees.ts, maintenance.ts
lib/ai/  (later)
actions/asset-actions.ts
tests/asset.test.ts
```

## Module Map
| Module | Responsibility | Owns | Build Order |
|---|---|---|---|
| assets | Asset CRUD + status transitions | assets table | 1st |
| employees | Employee list/lookup | employees table | 2nd |
| maintenance | Repair/maintenance logging | maintenance_logs table | 3rd |
| dashboard | Summary counts + flags | derived from assets | 4th |
| auth | Login/signup + RLS scoping | user_id columns | 5th (lock-down) |