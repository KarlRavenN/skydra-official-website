import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Synchronizes cookies directly with the Next.js request/response pipeline.
 */
export async function createClient() {
  const cookieStore = cookies();

  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can be ignored if called from a Server Component where mutating cookies is not permitted
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  );
}
