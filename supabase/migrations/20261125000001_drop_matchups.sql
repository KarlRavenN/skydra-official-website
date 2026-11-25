-- ==============================================================================
-- Migration: 20261125000001_drop_matchups.sql
-- Removes the fight-card feature (matchups). Replaced by YouTube "battles".
-- Run AFTER 20261124_init_schema.sql. Destructive: all matchup rows are deleted.
-- ==============================================================================

DROP POLICY IF EXISTS "Public can view matchups for published events" ON matchups;
DROP POLICY IF EXISTS "Admins have full access to matchups" ON matchups;
DROP TRIGGER IF EXISTS trigger_matchups_updated_at ON matchups;
DROP INDEX IF EXISTS idx_matchups_order;
DROP INDEX IF EXISTS idx_matchups_event_id;
DROP TABLE IF EXISTS matchups;
DROP TYPE IF EXISTS matchup_status;
