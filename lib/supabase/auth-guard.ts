import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminRole } from "@/types/database";

export interface AuthenticatedAdmin {
  id: string;
  email: string | null;
  fullName: string;
  role: AdminRole;
}

/**
 * Server-side admin check: valid Supabase session AND a row in admin_profiles.
 * An authenticated user who is NOT in admin_profiles is refused (returns null).
 */
export async function getAdminUser(): Promise<AuthenticatedAdmin | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("admin_profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    role: profile.role,
  };
}

/** For Server Components / layouts: redirects to the login page when not an admin. */
export async function requireAdminPage(): Promise<AuthenticatedAdmin> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login?error=forbidden");
  return admin;
}

/**
 * For Route Handlers. Usage:
 *   const auth = await requireAdminApi();
 *   if (!auth.ok) return auth.response;
 */
export async function requireAdminApi(): Promise<
  { ok: true; admin: AuthenticatedAdmin } | { ok: false; response: NextResponse }
> {
  const admin = await getAdminUser();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      ),
    };
  }
  return { ok: true, admin };
}
