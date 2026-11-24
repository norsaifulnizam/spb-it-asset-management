alter table assets add column if not exists disposal_category text;
alter table assets add column if not exists disposal_recipient text;

alter table assets drop constraint if exists assets_disposal_category_check;
alter table assets add constraint assets_disposal_category_check
  check (disposal_category is null or disposal_category in ('former_staff_mss', 'current_staff', 'sold', 'recycled_destroyed', 'other'));

-- The imported former-staff list should be visible separately from all other
-- disposed equipment without turning the recipients into active assignees.
update assets
set disposal_category = 'former_staff_mss',
    disposal_recipient = coalesce(disposal_recipient, previous_user)
where status = 'disposed'
  and disposal_category is null
  and notes ilike '%former staff%';
