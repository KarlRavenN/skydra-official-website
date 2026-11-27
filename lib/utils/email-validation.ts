/**
 * Shared email format & domain validation utilities.
 * Rejects malformed addresses (e.g. "john", "john@gmail", "john@abc") and
 * suspicious/fake TLDs (e.g. "john@hahas.iasdsa") on both client and server.
 */

const COMMON_VALID_TLDS = new Set([
  "com",
  "net",
  "org",
  "edu",
  "gov",
  "mil",
  "info",
  "biz",
  "io",
  "co",
  "me",
  "app",
  "dev",
  "ai",
  "tv",
  "cc",
  "ph",
  "uk",
  "us",
  "ca",
  "au",
  "sg",
  "jp",
  "kr",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "se",
  "no",
  "ch",
  "in",
  "id",
  "my",
  "th",
  "vn",
  "hk",
  "tw",
  "nz",
  "br",
  "mx",
  "pro",
  "xyz",
  "site",
  "online",
  "store",
  "tech",
  "cloud",
  "live",
  "club",
  "email",
  "gg",
]);

const EMAIL_SYNTAX_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmailSyntax(rawEmail: string): boolean {
  const email = rawEmail.trim().toLowerCase();
  if (!email || email.length > 254) return false;
  if (!EMAIL_SYNTAX_REGEX.test(email)) return false;

  const [local, domain] = email.split("@");
  if (!local || !domain || local.length > 64) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) return false;

  // Reject obviously invalid/random TLDs on the client before submission
  if (!COMMON_VALID_TLDS.has(tld)) return false;

  return true;
}

export function getEmailValidationError(rawEmail: string): string | null {
  const email = rawEmail.trim();
  if (!email) return "Email address is required";
  if (!email.includes("@")) return "Please enter a valid email address (e.g. john@gmail.com)";

  const [, domain] = email.split("@");
  if (!domain || !domain.includes(".")) {
    return "Email must include a valid domain (e.g. gmail.com)";
  }

  if (!isValidEmailSyntax(email)) {
    return "Please enter a valid email address with a legitimate domain";
  }

  return null;
}
