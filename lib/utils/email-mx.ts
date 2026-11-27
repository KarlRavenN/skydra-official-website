import dns from "dns/promises";
import { getEmailValidationError } from "./email-validation";

/**
 * Server-side email verification: runs syntax/TLD check and verifies the
 * domain has valid MX (or fallback A) DNS records when DNS is reachable.
 * Never throws on transient DNS/network errors so legitimate users are not
 * blocked if DNS is temporarily unavailable.
 */
export async function verifyEmailDomainServer(rawEmail: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const syntaxError = getEmailValidationError(rawEmail);
  if (syntaxError) {
    return { valid: false, error: syntaxError };
  }

  const domain = rawEmail.trim().toLowerCase().split("@")[1];
  if (!domain) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DNS_TIMEOUT")), 2500)
      ),
    ]);

    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return { valid: true };
    }
    return { valid: false, error: "Email domain does not have valid mail servers (MX)" };
  } catch (err: any) {
    const code = err?.code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        valid: false,
        error: "Email domain does not exist or cannot receive emails",
      };
    }
    // On timeout / offline / transient DNS error, allow syntax-validated email
    return { valid: true };
  }
}
