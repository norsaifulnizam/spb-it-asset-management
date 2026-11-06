# Tasks & Sprints

## Sprint 1 — Database + Asset CRUD (core engine) ⭐ v1 starts
**Goal:** Register, list, and edit assets against the database.
- Create `assets`, `employees`, `maintenance_logs` tables + seed data (migration SQL).
- Build `lib/data/` layer (all DB reads/writes).
- Assets list page: loading skeleton, empty state, error state, ready.
- Register asset form (persists to DB).
- Edit asset (status, condition, location, notes).
- Responsive sidebar shell (desktop sidebar / mobile hamburger).
- **DoD:** IT staff can register a laptop and see it in the list after refresh — no dead buttons.

## Sprint 2 — Assignment + Maintenance Workflow ⭐ v1 functional milestone
**Goal:** The full register→assign→repair→return cycle works end-to-end.
- Assign asset to employee (status → assigned).
- Return asset (status → available, clear employee).
- Send for repair (status → under_repair, auto-create maintenance log).
- Maintenance history view per asset.
- Dashboard summary cards (total, assigned, available, under repair, warranty expired).
- Employee picker on asset detail.
- **DoD:** Success scenario from PRD works — register, assign, repair, return, and every state is reflected in list + history.

## Sprint 3 — Search, Filter, Flags
**Goal:** Find assets fast and surface items needing attention.
- Search by tag, serial, brand/model.
- Filter by type, status, location, assigned employee.
- Warranty expiry flag (red if past).
- Condition badge colors (green/fair/yellow/poor/red).
- Attention-score ranked list on dashboard.
- **DoD:** Searching "SPB-LT" returns matching assets; expired warranty assets show red flag.

## Sprint 4 — Lock It Down
**Goal:** Add auth + owner-scoped RLS.
- Supabase auth (login/signup pages).
- Replace permissive RLS with `auth.uid() = user_id` policies.
- Role check: IT admin vs department admin (read-only).
- Remove demo seed data for production use.
- **DoD:** Anonymous access blocked; logged-in IT admin can manage; department admin can only view.

## Gantt
```
Sprint 1  ██████████  DB + Asset CRUD
Sprint 2  ██████████  Assignment + Maintenance  ← v1 functional
Sprint 3  ██████████  Search/Filter/Flags
Sprint 4  ██████████  Lock Down (Auth + RLS)
```