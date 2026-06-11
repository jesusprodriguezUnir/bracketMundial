-- Migration: League edit-locking config
-- Adds frozen flag and locked_before_date to leagues table.

alter table leagues
  add column if not exists frozen boolean not null default false;

alter table leagues
  add column if not exists locked_before_date date;

-- Comment on new columns
comment on column leagues.frozen is
  'When true, all prediction editing is disabled for all members of this league (owner can toggle).';

comment on column leagues.locked_before_date is
  'YYYY-MM-DD cutoff date. Matches with a date strictly before this value are locked for editing and excluded from scoring. Set when a league is created mid-tournament.';

-- RLS: The existing UPDATE policy already restricts updates to the owner (owner_id = auth.uid()).
-- No additional policies needed — frozen and locked_before_date are covered by that policy.
