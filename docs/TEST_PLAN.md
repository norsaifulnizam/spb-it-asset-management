# Test Plan

## v1 Success Scenario (manual)
1. Open app — Assets page loads with 5 seeded assets (no login required).
2. Click **Register Asset** → fill: tag `SPB-LT-006`, type Laptop, model `HP EliteBook 840`, serial `HP840SN006`, purchase date today, warranty +3 years, condition good, location `HQ Floor 4` → **Save**.
3. New laptop appears in asset list with status `available`.
4. Open asset detail → select employee **Ahmad Rahman** → click **Assign** → status becomes `assigned`.
5. Click **Send for Repair** → status `under_repair`, maintenance log entry appears in history.
6. Click **Mark Available** → status `available`, employee cleared.
7. Maintenance history tab shows the repair log entry.

## Empty State
- Clear all search filters → shows full list.
- Search non-existent tag `ZZZ-999` → shows "No assets found" empty state.

## Error State
- Disconnect network, click **Register Asset** → form shows error message, does not crash.
- Submit form with missing required fields (tag, type, model) → validation errors shown inline.

## Loading State
- Asset list page shows skeleton rows while fetching.

## Partial State
- Asset with no assigned employee → shows "Unassigned" badge, not blank.
- Asset with no serial number → shows "—" not null.

## Permission (later — Sprint 4)
- Logged-out user redirected to login.
- Department admin can view but not edit.
- IT admin can full CRUD.