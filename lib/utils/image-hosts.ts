/**
 * Hosts that next/image is allowed to load. MUST mirror images.remotePatterns
 * in next.config.mjs. Anything else is rendered as a placeholder so a bad URL
 * can never crash a page again.
 */
const ALLOWED_HOST_SUFFIXES = [".supabase.co"];
const ALLOWED_HOSTS = ["images.unsplash.com", "i.ytimg.com", "img.youtube.com"];

export function isAllowedImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      ALLOWED_HOSTS.includes(host) ||
      ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
    );
  } catch {
    return false;
  }
}
