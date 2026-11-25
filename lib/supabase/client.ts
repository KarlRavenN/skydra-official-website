import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 * Maintains authentication state automatically via browser cookies.
 */
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
