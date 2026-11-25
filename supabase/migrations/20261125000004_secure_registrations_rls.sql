-- ==============================================================================
-- Migration: 20261125000004_secure_registrations_rls.sql
-- Privacy lock-down: the public (anon) key can no longer read OR insert
-- registrations. All access goes through server code using the service role.
-- The admin policy ("Admins have full access to registrations") stays.
-- The capacity trigger on registrations stays too.
-- ==============================================================================

DROP POLICY IF EXISTS "Public can register for open events" ON registrations;
DROP POLICY IF EXISTS "Attendees can view their ticket by code" ON registrations;
