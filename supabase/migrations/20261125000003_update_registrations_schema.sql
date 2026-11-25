-- ==============================================================================
-- Migration: 20261125000003_update_registrations_schema.sql
-- Aligns registrations with the planning doc: no email, no stage name; adds
-- Facebook profile, age, barangay, city, emergency contact and consents.
--
-- WARNING (destructive): existing registration rows were created with the old
-- form and have no consent / address data, so they are DELETED first. The live
-- database only held test data when this migration was written.
-- ==============================================================================

DELETE FROM registrations;

DROP INDEX IF EXISTS idx_unique_event_email;
DROP INDEX IF EXISTS idx_registrations_email;

ALTER TABLE registrations
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS stage_name,
  ADD COLUMN facebook_profile TEXT NOT NULL,
  ADD COLUMN age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 120),
  ADD COLUMN barangay TEXT NOT NULL,
  ADD COLUMN city TEXT NOT NULL,
  ADD COLUMN emergency_contact_name TEXT NOT NULL,
  ADD COLUMN emergency_contact_number TEXT NOT NULL,
  ADD COLUMN house_rules_accepted BOOLEAN NOT NULL CHECK (house_rules_accepted = TRUE),
  ADD COLUMN privacy_accepted BOOLEAN NOT NULL CHECK (privacy_accepted = TRUE),
  ADD COLUMN consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- phone_number stays and is the attendee's contact number.
-- One non-cancelled registration per (event, name, contact number).
CREATE UNIQUE INDEX idx_unique_event_name_phone
  ON registrations (event_id, LOWER(full_name), phone_number)
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone_number);
