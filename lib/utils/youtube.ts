/**
 * YouTube URL helpers (pure functions, safe on server and client).
 * Accepts watch, youtu.be, shorts and embed links, with or without www./m.
 * and with extra query params. Any other host is rejected.
 */

const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

export interface ParsedYouTubeUrl {
  videoId: string;
  normalizedUrl: string;
  thumbnailUrl: string;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function isValidYouTubeVideoId(id: string | null | undefined): id is string {
  return !!id && VIDEO_ID_REGEX.test(id);
}

export function parseYouTubeUrl(input: string | null | undefined): ParsedYouTubeUrl | null {
  if (!input) return null;
  let raw = input.trim();
  if (!raw) return null;

  // Allow pasted links without a scheme, e.g. "youtu.be/abc..."
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  let candidate: string | null = null;

  if (SHORT_HOSTS.has(host)) {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "watch") {
      candidate = url.searchParams.get("v");
    } else if (segments[0] === "shorts" || segments[0] === "embed") {
      candidate = segments[1] ?? null;
    }
  } else {
    return null;
  }

  if (!isValidYouTubeVideoId(candidate)) return null;

  return {
    videoId: candidate,
    normalizedUrl: `https://www.youtube.com/watch?v=${candidate}`,
    thumbnailUrl: getYouTubeThumbnailUrl(candidate),
  };
}
