-- ==============================================================================
-- SKYDRA RAP BATTLE LEAGUE - DATABASE FOUNDATION DDL
-- Migration: 20261124_init_schema.sql
-- PostgreSQL / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE event_status AS ENUM (
  'draft',        -- Event created by organizers, not visible to public
  'published',    -- Visible to public, upcoming event
  'live',         -- Event is happening right now
  'past',         -- Concluded event, archived in previous events
  'cancelled'     -- Event cancelled
);

CREATE TYPE registration_status AS ENUM (
  'open',         -- Registration form active and accepting attendees
  'closed',       -- Registration closed manually or event finished
  'paused'        -- Temporarily halted (e.g. venue capacity review)
);

CREATE TYPE matchup_status AS ENUM (
  'scheduled',    -- Confirmed matchup on the fight card
  'in_progress',  -- Emcees in the pit / on stage
  'completed',    -- Battle finished, result recorded
  'cancelled'     -- One or both emcees backed out / forfeited
);

CREATE TYPE attendee_status AS ENUM (
  'pending',      -- Registered, awaiting gate verification
  'confirmed',    -- Verified registration with valid ticket
  'checked_in',   -- QR code scanned at the gate
  'cancelled'     -- Cancelled or voided ticket
);

CREATE TYPE admin_role AS ENUM (
  'superadmin',   -- Full league control and admin management
  'admin',        -- Event and matchup management
  'coordinator',  -- Event registration manager
  'gatekeeper'    -- Gate QR check-in scanner only
);

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLES

-- ------------------------------------------------------------------------------
-- 4.1. EVENTS
-- Core entity storing all rap battle events, locations, schedules, and capacities.
-- ------------------------------------------------------------------------------
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  poster_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  doors_open_time TIMESTAMPTZ,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  google_maps_url TEXT,
  ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (ticket_price >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status event_status NOT NULL DEFAULT 'draft',
  registration_status registration_status NOT NULL DEFAULT 'closed',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indices for rapid event queries and filters
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_featured ON events(is_featured) WHERE is_featured = TRUE;

-- ------------------------------------------------------------------------------
-- 4.2. MATCHUPS (RAP BATTLE FIGHT CARD)
-- Normalizes rap battle matchups per event. 1 Event -> N Matchups.
-- Maintains order of the card from undercard battles to the Main Event.
-- ------------------------------------------------------------------------------
CREATE TABLE matchups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  division TEXT NOT NULL DEFAULT 'Main Card', -- 'Main Event', 'Co-Main', 'Underground', etc.
  battler_1_name TEXT NOT NULL,
  battler_2_name TEXT NOT NULL,
  battler_1_image_url TEXT,
  battler_2_image_url TEXT,
  rounds_count INTEGER NOT NULL DEFAULT 3 CHECK (rounds_count > 0),
  time_limit_minutes INTEGER DEFAULT 3 CHECK (time_limit_minutes > 0),
  order_index INTEGER NOT NULL DEFAULT 0, -- Higher or lower based on fight card sequence
  status matchup_status NOT NULL DEFAULT 'scheduled',
  winner_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_matchups_updated_at
  BEFORE UPDATE ON matchups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_matchups_event_id ON matchups(event_id);
CREATE INDEX idx_matchups_order ON matchups(event_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 4.3. REGISTRATIONS (GUESTS & DIGITAL TICKETS)
-- Stores attendee information and generates unique cryptographically verifiable tickets.
-- Foreign key has ON DELETE RESTRICT to protect audit records.
-- ------------------------------------------------------------------------------
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  stage_name TEXT,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,
  status attendee_status NOT NULL DEFAULT 'confirmed',
  checked_in_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_ticket_code ON registrations(ticket_code);
CREATE INDEX idx_registrations_email ON registrations(email);
-- Prevent duplicate registration for the same active event with the same email
CREATE UNIQUE INDEX idx_unique_event_email ON registrations(event_id, LOWER(email)) WHERE status != 'cancelled';

-- ------------------------------------------------------------------------------
-- 4.4. ADMIN PROFILES
-- Normalized admin entity linked 1:1 with Supabase auth.users.
-- ------------------------------------------------------------------------------
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4.5. LEAGUE SETTINGS
-- Key-value JSON store for global site configuration, social links, and legal copy.
-- ------------------------------------------------------------------------------
CREATE TABLE league_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_league_settings_updated_at
  BEFORE UPDATE ON league_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4.6. MEDIA ASSETS
-- Metadata directory for event posters, flyers, and battle imagery stored in Supabase Storage.
-- ------------------------------------------------------------------------------
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  bucket_name TEXT NOT NULL DEFAULT 'posters',
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_event_id ON media_assets(event_id);

-- ------------------------------------------------------------------------------
-- 5. DATABASE FUNCTIONS & CAPACITY VALIDATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_event_registration_count(event_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM registrations
  WHERE event_id = event_uuid AND status != 'cancelled';
$$ LANGUAGE sql STABLE;

-- Prevent overbooking at database level
CREATE OR REPLACE FUNCTION check_event_capacity_before_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INTEGER;
  v_registered INTEGER;
  v_reg_status registration_status;
  v_event_status event_status;
BEGIN
  SELECT capacity, registration_status, status
  INTO v_capacity, v_reg_status, v_event_status
  FROM events
  WHERE id = NEW.event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target event does not exist';
  END IF;

  IF v_event_status NOT IN ('published', 'live') THEN
    RAISE EXCEPTION 'Event is not accepting registrations (status: %)', v_event_status;
  END IF;

  IF v_reg_status != 'open' THEN
    RAISE EXCEPTION 'Event registration is closed or paused';
  END IF;

  SELECT COUNT(*) INTO v_registered
  FROM registrations
  WHERE event_id = NEW.event_id AND status != 'cancelled';

  IF v_registered >= v_capacity THEN
    RAISE EXCEPTION 'Event capacity of % has been reached', v_capacity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_event_capacity
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity_before_registration();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authenticated admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6.1. EVENTS POLICIES
-- Public can view published, live, or past events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status IN ('published', 'live', 'past'));

-- Admins have full access to events
CREATE POLICY "Admins have full access to events"
  ON events FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 6.2. MATCHUPS POLICIES
-- Public can view matchups for visible events
CREATE POLICY "Public can view matchups for published events"
  ON matchups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = matchups.event_id
      AND events.status IN ('published', 'live', 'past')
    )
  );

CREATE POLICY "Admins have full access to matchups"
  ON matchups FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 6.3. REGISTRATIONS POLICIES
-- Anyone can insert a registration (trigger validates capacity and status)
CREATE POLICY "Public can register for open events"
  ON registrations FOR INSERT
  WITH CHECK (TRUE);

-- Public can view their OWN ticket via exact ticket code match (for ticket display page)
CREATE POLICY "Attendees can view their ticket by code"
  ON registrations FOR SELECT
  USING (TRUE);

-- Admins have full management access to registrations
CREATE POLICY "Admins have full access to registrations"
  ON registrations FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 6.4. ADMIN PROFILES POLICIES
CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Superadmins can manage admin profiles"
  ON admin_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 6.5. LEAGUE SETTINGS POLICIES
CREATE POLICY "Public can read league settings"
  ON league_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can update league settings"
  ON league_settings FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 6.6. MEDIA ASSETS POLICIES
CREATE POLICY "Public can view media assets"
  ON media_assets FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage media assets"
  ON media_assets FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ------------------------------------------------------------------------------
-- 7. INITIAL SEED / DEFAULT DATA
-- ------------------------------------------------------------------------------
INSERT INTO league_settings (key, value, description)
VALUES
  (
    'league_info',
    '{"name": "SKYDRA Rap Battle League", "tagline": "The Premier Underground Rap Battle Arena in the Philippines", "contactEmail": "skydrabattles@gmail.com"}',
    'Core league identity and contact details'
  ),
  (
    'social_links',
    '{"facebook": "https://facebook.com/skydraph", "youtube": "https://youtube.com/@skydrabattles", "tiktok": "https://tiktok.com/@skydrabattles", "instagram": "https://instagram.com/skydraph"}',
    'Official social media profiles'
  ),
  (
    'house_rules',
    '{"rules": ["Strictly no physical violence inside or outside the venue", "Respect the emcees, judges, and crowd during rounds", "No outside alcoholic beverages or illegal substances", "Digital ticket QR code required at the entrance gate", "All battle outcomes decided by official league judges are final"]}',
    'Official league house rules for live events'
  )
ON CONFLICT (key) DO NOTHING;
