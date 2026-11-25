import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Generates an unguessable ticket code.
 * Format: SKY-{YEAR}-{22 URL-safe chars} (16 random bytes = 128 bits of entropy).
 * Example: SKY-2026-q3F9x0kZ1b7mH2cT5dJ8wA
 * The code is the public ticket id and is used in the ticket URL, so it must
 * never be sequential or short enough to brute force.
 */
export function generateTicketCode(prefix = "SKY"): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(16).toString("base64url");
  return `${prefix}-${year}-${random}`;
}

/** Cheap shape check before hitting the database with a ticket code from a URL. */
export function isWellFormedTicketCode(code: string): boolean {
  return /^SKY-\d{4}-[A-Za-z0-9_-]{16,64}$/.test(code);
}

/**
 * Generates a Data URL QR Code representing the ticket verification URL.
 */
export async function generateTicketQRCode(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate ticket QR code");
  }
}
