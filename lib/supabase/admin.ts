import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

/**
 * Elevated Supabase Admin Client using the Service Role Key.
 *
 * CRITICAL SECURITY INSTRUCTION:
 * - NEVER import or execute this on the client side.
 * - Used exclusively on the server for privileged operations (e.g. atomic ticket issuance, admin provisioning).
 * - Bypasses Row Level Security (RLS) policies.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment"
    );
  }

  return createClient<any>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
