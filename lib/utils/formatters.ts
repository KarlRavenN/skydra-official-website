/**
 * Utility functions for consistent date, currency, and slug formatting across Skydra.
 * The league is based in the Philippines (PST - UTC+8).
 */

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "TBA";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "TBA";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatCurrency(amount: number): string {
  if (amount <= 0) return "FREE ADMISSION";
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Asia/Manila (PHT, UTC+8, no daylight saving) helpers.
 * Admin <input type="datetime-local"> values are "YYYY-MM-DDTHH:mm" with NO
 * timezone. They must always be interpreted as Manila time, not as the
 * browser's or the server's timezone.
 */
const MANILA_OFFSET = "+08:00";

/** "2026-12-05T19:00" (Manila wall time) -> "2026-12-05T19:00:00+08:00". Returns null if invalid/empty. */
export function fromManilaDateTimeLocal(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) {
    // Already a full ISO string with an offset/Z: keep it as an instant.
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const iso = `${match[1]}T${match[2]}:00${MANILA_OFFSET}`;
  return isNaN(new Date(iso).getTime()) ? null : iso;
}

/** Stored instant (ISO/TIMESTAMPTZ) -> "YYYY-MM-DDTHH:mm" in Manila wall time for datetime-local inputs. */
export function toManilaDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Time only, e.g. "7:00 PM", in Manila time. */
export function formatTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "TBA";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Invalid Time";
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
