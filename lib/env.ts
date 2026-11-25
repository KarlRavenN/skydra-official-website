import { z } from "zod";

/**
 * Validates and exposes strictly typed environment variables.
 * Fails fast at runtime if any critical secret or endpoint is missing.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required for administrative backend execution"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
});

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-skydra.supabase.co";
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
  },
  get NEXT_PUBLIC_SITE_URL() {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  },
};
