import { z } from "zod";
import { Database, AttendeeStatus } from "./database";

export type RegistrationRow = Database["public"]["Tables"]["registrations"]["Row"];
export type RegistrationInsert = Database["public"]["Tables"]["registrations"]["Insert"];
export type RegistrationUpdate = Database["public"]["Tables"]["registrations"]["Update"];

const FACEBOOK_HOSTS = ["facebook.com", "fb.com", "fb.me", "m.me"];

/**
 * Facebook Profile: either a profile link (any facebook.com / fb.com / fb.me
 * URL) or just the profile name. Anything that looks like a link to another
 * site is rejected.
 */
function isValidFacebookProfile(value: string): boolean {
  const v = value.trim();
  if (v.length < 2 || v.length > 200) return false;

  const looksLikeLink = /^https?:\/\//i.test(v) || /^(www\.|m\.)?[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(v);
  if (!looksLikeLink) {
    // A plain profile name: anything except characters that only make sense in markup or URLs.
    return !/[<>{}\[\]\\|^`"/:;=?#%$&*+!~()]/.test(v);
  }

  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    const host = url.hostname.toLowerCase().replace(/^(www|m|web|mobile)\./, "");
    return FACEBOOK_HOSTS.includes(host);
  } catch {
    return false;
  }
}

const phoneSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(7, `Please provide a valid ${label}`)
    .max(20, `${label} is too long`)
    .regex(/^[0-9+() -]+$/, `${label} can only contain digits, +, spaces, dashes and parentheses`)
    .refine((v) => v.replace(/\D/g, "").length >= 7, `Please provide a valid ${label}`);

/**
 * Validation schema for the public event registration form.
 * Fields match the planning document exactly (no email, no stage name).
 */
export const registrationFormSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  facebookProfile: z
    .string()
    .trim()
    .refine(isValidFacebookProfile, "Enter your Facebook profile link or profile name"),
  age: z.coerce
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(1, "Age must be between 1 and 120")
    .max(120, "Age must be between 1 and 120"),
  phoneNumber: phoneSchema("contact number"),
  barangay: z.string().trim().min(2, "Barangay is required").max(100, "Barangay is too long"),
  city: z.string().trim().min(2, "City is required").max(100, "City is too long"),
  emergencyContactName: z
    .string()
    .trim()
    .min(2, "Emergency contact name is required")
    .max(100, "Emergency contact name is too long"),
  emergencyContactNumber: phoneSchema("emergency contact number"),
  houseRulesAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the House Rules" }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Privacy Policy" }),
  }),
});

export type RegistrationFormInput = z.input<typeof registrationFormSchema>;
export type RegistrationFieldErrors = Partial<Record<keyof RegistrationFormInput, string>>;

/**
 * Public Digital Ticket payload. Deliberately contains ONLY what the public
 * ticket page may show: ticket id, QR, attendee name, event info, status.
 * Never add contact number, Facebook, age, address or emergency contact here.
 */
export interface DigitalTicketPayload {
  ticketCode: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  status: AttendeeStatus;
  qrCodeDataUrl: string;
}

/**
 * Registration search and filter parameters for Admin table
 */
export interface RegistrationFilters {
  eventId?: string;
  search?: string;
  status?: AttendeeStatus | "all";
}
