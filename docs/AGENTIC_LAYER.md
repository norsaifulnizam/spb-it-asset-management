# Agentic Layer

## Draftable Actions (low risk — auto)
- Auto-fill asset fields from free-text description → draft, staff confirms.
- Tag asset type/condition from input → draft for review.
- Summarise maintenance history → auto-generated note.

## Executable After Approval (medium risk — light approval)
- Update asset status (assigned → under_repair) — IT staff approves.
- Reassign asset to different employee — IT staff confirms.
- Flag asset for warranty follow-up → create a follow-up note.

## Human-Only Actions (critical — no auto)
- Delete an asset record.
- Retire an asset (status → retired).
- Bulk import/overwrite from spreadsheet.

## Named Tools (later)
- `parse_asset_description` — text → structured asset fields.
- `score_asset_attention` — compute attention score.
- `summarise_maintenance_history` — generate summary for an asset.

No `run_any` / `send_any` — only these named tools.

## Audit Log Fields (later)
`actor_id, action, target_asset_id, before_status, after_status, timestamp, approved_by`

## v1 vs Later
- **v1:** Manual actions only; no agentic automation. Status transitions done by IT staff clicking buttons.
- **Later:** AI-assisted drafting + approval flows + audit logging.