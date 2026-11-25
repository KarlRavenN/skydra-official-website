-- Fix: infinite RLS recursion on admin_profiles.
-- The "Superadmins can manage admin profiles" policy (FOR ALL) queried admin_profiles
-- from inside its own USING clause. Postgres evaluates every permissive policy for a
-- SELECT, so any authenticated read of admin_profiles failed with
-- "infinite recursion detected in policy for relation admin_profiles".
-- The middleware swallowed that error, saw "no row", and redirected to
-- /admin/login?error=forbidden even for real admins.

CREATE OR REPLACE FUNCTION is_superadmin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

DROP POLICY IF EXISTS "Superadmins can manage admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Users can read own admin profile" ON admin_profiles;

-- A signed-in user can always read their own row (what the auth check needs).
CREATE POLICY "Users can read own admin profile"
  ON admin_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles FOR SELECT TO authenticated
  USING (is_admin_user());

CREATE POLICY "Superadmins can manage admin profiles"
  ON admin_profiles FOR ALL TO authenticated
  USING (is_superadmin_user())
  WITH CHECK (is_superadmin_user());
