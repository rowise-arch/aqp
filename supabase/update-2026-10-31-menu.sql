-- Run once in Supabase (SQL Editor -> New query -> paste -> Run) if you already imported the price list.
-- It matches the studio's newer price list: six changed prices and two new make-up services.
-- Safe to run twice.

-- 1. Allow a fourth group, "Makeup"
alter table services drop constraint if exists services_grp_check;
alter table services add constraint services_grp_check
  check (grp in ('Hair', 'Nails', 'Brows, lashes & waxing', 'Makeup'));

-- 2. Changed prices
update services set price = 100 where grp = 'Brows, lashes & waxing' and name = 'Eyebrow shaving';
update services set price = 150 where grp = 'Brows, lashes & waxing' and name = 'Eyebrow threading';
update services set price = 250 where grp = 'Brows, lashes & waxing' and name = 'Waxing' and variant = 'Underarm';
update services set price = 300 where grp = 'Brows, lashes & waxing' and name = 'Waxing' and variant = 'Legs';
update services set price = 500 where grp = 'Brows, lashes & waxing' and name = 'Waxing' and variant = 'Full legs';
update services set price = 400 where grp = 'Brows, lashes & waxing' and name = 'Eyelash extension' and variant = 'Medium';
update services set price = 150 where grp = 'Brows, lashes & waxing' and name = 'Eyelash extension removal';

-- 3. New make-up services
insert into services (id, grp, name, variant, price, sort, active) values
  ('s53', 'Makeup', 'Commercial hair and make up', null, 1000, 52, true),
  ('s54', 'Makeup', 'Progressive evening hair and make up', null, 1500, 53, true)
on conflict (id) do nothing;

-- Check: should list the changed rows
select grp, name, variant, price from services
where grp = 'Makeup' or (grp = 'Brows, lashes & waxing') order by grp, sort;
