-- ==============================================================================
-- Migration: 20261125000002_create_battles.sql
-- Battles = published rap battle videos hosted on YouTube, optionally linked
-- to the event where they happened.
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'battle_type') THEN
    CREATE TYPE battle_type AS ENUM ('tournament', 'non_tournament');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL CHECK (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  battle_type battle_type NOT NULL DEFAULT 'non_tournament',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  battle_date DATE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_battles_updated_at ON battles;
CREATE TRIGGER trigger_battles_updated_at
  BEFORE UPDATE ON battles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_battles_event_id ON battles(event_id);
CREATE INDEX IF NOT EXISTS idx_battles_date ON battles(battle_date DESC, created_at DESC);

ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published battles" ON battles;
CREATE POLICY "Public can view published battles"
  ON battles FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admins have full access to battles" ON battles;
CREATE POLICY "Admins have full access to battles"
  ON battles FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());
