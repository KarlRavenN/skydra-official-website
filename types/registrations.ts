import { z } from "zod";
import { Database, AttendeeStatus, PaymentStatus } from "./database";
import { getEmailValidationError } from "@/lib/utils/email-validation";

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

  const looksLikeLink =
    /^https?:\/\//i.test(v) || /^(www\.|m\.)?[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(v);
  if (!looksLikeLink) {
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

/**
 * Contact Number: numbers only, starts with 09, exactly 11 digits.
 */
export const contactNumberSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Contact number must contain numbers only")
  .refine((v) => v.startsWith("09"), "Contact number must start with 09")
  .refine((v) => v.length === 11, "Contact number must be exactly 11 digits");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email address is too long")
  .superRefine((val, ctx) => {
    const err = getEmailValidationError(val);
    if (err) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
    }
  });

/**
 * Validation schema for the public event registration form.
 * Contains ONLY: Full Name, Email Address, Facebook Profile, Age, Contact Number,
 * plus required policy consents.
 */
export const registrationFormSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: emailSchema,
  facebookProfile: z
    .string()
    .trim()
    .refine(isValidFacebookProfile, "Enter your Facebook profile link or profile name"),
  age: z.coerce
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(1, "Age must be between 1 and 120")
    .max(120, "Age must be between 1 and 120"),
  phoneNumber: contactNumberSchema,
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
 * Validation schema for paid ticket GCash payment proof submission.
 */
export const paymentSubmissionSchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID"),
  paymentReference: z
    .string()
    .trim()
    .min(4, "Reference number is required")
    .max(100, "Reference number is too long"),
  paymentScreenshotUrl: z
    .string()
    .trim()
    .url("Payment screenshot is required")
    .refine((v) => /^https?:\/\//i.test(v), "Invalid screenshot URL"),
});

export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;

/**
 * Public Digital Ticket payload. Deliberately contains ONLY what the public
 * ticket page may show: ticket id, QR, attendee name, event info, status.
 */
export interface DigitalTicketPayload {
  ticketCode: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  status: AttendeeStatus;
  paymentStatus?: PaymentStatus;
  qrCodeDataUrl: string;
}

/**
 * Registration search and filter parameters for Admin table
 */
export interface RegistrationFilters {
  eventId?: string;
  search?: string;
  status?: AttendeeStatus | "all";
  paymentStatus?: PaymentStatus | "all";
}
