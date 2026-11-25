import { createAdminClient } from "@/lib/supabase/admin";

export const POSTER_BUCKET = "posters";
export const POSTER_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const POSTER_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Extracts "events/<uuid>.webp" from a public Supabase Storage URL of our posters bucket. */
export function getPosterStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${POSTER_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const path = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    return path || null;
  } catch {
    return null;
  }
}

/** Best-effort server-side delete. Never throws: a failed cleanup must not fail the request. */
export async function deletePosterByUrl(url: string | null | undefined): Promise<void> {
  const path = getPosterStoragePath(url);
  if (!path) return;
  try {
    const admin = createAdminClient();
    await admin.storage.from(POSTER_BUCKET).remove([path]);
  } catch (err) {
    console.error("Poster cleanup failed (ignored):", err);
  }
}
