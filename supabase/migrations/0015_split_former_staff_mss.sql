-- Keep former staff and MSS transfers as separate disposed-asset categories.
alter table assets drop constraint if exists assets_disposal_category_check;

update assets
set disposal_category = 'mss'
where disposal_category = 'former_staff_mss'
  and notes ilike '%mss%';

update assets
set disposal_category = 'former_staff'
where disposal_category = 'former_staff_mss';

alter table assets add constraint assets_disposal_category_check
  check (disposal_category is null or disposal_category in (
    'former_staff',
    'mss',
    'current_staff',
    'sold',
    'recycled_destroyed',
    'other'
  ));

notify pgrst, 'reload schema';
