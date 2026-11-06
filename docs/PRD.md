# IT Asset Management — PRD

## Problem
Selangor Properties IT team tracks laptops, monitors, phones, accessories, and software in spreadsheets. Locating assets, verifying ownership, and following up on returns or repairs is slow and error-prone.

## Target User
- **Primary:** IT administrators and IT support staff at Selangor Properties.
- **Secondary:** Department administrators (read-only check of asset assignments).

## Core Objects
- **Asset** — tag number, type, brand/model, serial number, purchase date, warranty expiry, condition, location, assigned employee, status, notes.
- **Employee** — name, department, email.
- **Maintenance Log** — asset, log type (repair/maintenance/return), description, logged date.

## MVP (v1) — Must-haves
- [ ] Register a new asset with all core fields.
- [ ] Assign an asset to an employee (status → assigned).
- [ ] Return an asset (status → available, unassign).
- [ ] Send asset for repair (status → under_repair, auto-create maintenance log).
- [ ] List all assets with status, condition, location, assigned employee.
- [ ] View maintenance history per asset.
- [ ] Dashboard summary: total assets, assigned, available, under repair, warranty-expired count.
- [ ] Search and filter by type, status, location, employee.

## Non-goals (v1)
No barcode/QR scanning, no employee self-service portal, no purchase-order integration, no automated email reminders, no mobile app, no approval workflow, no advanced reports.

## Success Criteria
An IT staff member registers a new laptop, assigns it to Ahmad Rahman in Finance, sends it for repair two months later (auto-logging the maintenance entry), then marks it returned and available — and every state change is visible in the asset list and maintenance history within one screen.