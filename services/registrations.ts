import { createAdminClient } from "@/lib/supabase/admin";
import { generateTicketCode, generateTicketQRCode, isWellFormedTicketCode } from "@/lib/utils/ticket";
import { toCsv, sanitizeSearchTerm } from "@/lib/utils/csv";
import {
  registrationFormSchema,
  DigitalTicketPayload,
  RegistrationFieldErrors,
  RegistrationFilters,
  RegistrationRow,
} from "@/types/registrations";
import { env } from "@/lib/env";

const ADMIN_SELECT = `
  id,
  event_id,
  full_name,
  facebook_profile,
  age,
  phone_number,
  barangay,
  city,
  emergency_contact_name,
  emergency_contact_number,
  house_rules_accepted,
  privacy_accepted,
  consent_at,
  ticket_code,
  status,
  checked_in_at,
  created_at,
  event:events(title)
`;

export type AdminRegistrationRow = RegistrationRow & { event_title: string };

async function buildTicket(
  registration: { ticket_code: string; full_name: string; status: RegistrationRow["status"] },
  event: { title: string; event_date: string; venue_name: string; venue_address: string }
): Promise<DigitalTicketPayload> {
  const verificationUrl = `${env.NEXT_PUBLIC_SITE_URL}/tickets/${registration.ticket_code}`;
  const qrCodeDataUrl = await generateTicketQRCode(verificationUrl);

  return {
    ticketCode: registration.ticket_code,
    attendeeName: registration.full_name,
    eventName: event.title,
    eventDate: event.event_date,
    venueName: event.venue_name,
    venueAddress: event.venue_address,
    status: registration.status,
    qrCodeDataUrl,
  };
}

/**
 * ALL registration reads and writes live here and use the service-role client.
 * The public anon key has no access to the registrations table (see migration
 * 20261125000004_secure_registrations_rls.sql).
 */
export const RegistrationService = {
  /**
   * Registers a guest for an event: validates input, verifies event state,
   * capacity and duplicates, creates the registration and issues a digital ticket.
   */
  async registerAttendee(rawInput: unknown): Promise<{
    success: boolean;
    ticket?: DigitalTicketPayload;
    error?: string;
    fieldErrors?: RegistrationFieldErrors;
  }> {
    const parseResult = registrationFormSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const fieldErrors: RegistrationFieldErrors = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path[0] as keyof RegistrationFieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
    }
    const input = parseResult.data;
    const admin = createAdminClient();

    // 1. Event state
    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id, title, event_date, venue_name, venue_address, capacity, status, registration_status")
      .eq("id", input.eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "The requested event could not be found." };
    }
    if (event.status !== "published" && event.status !== "live") {
      return { success: false, error: "This event is currently not active." };
    }
    if (event.registration_status !== "open") {
      return { success: false, error: "Registration for this event is currently closed." };
    }

    // 2. Duplicate check: same event + same name (case-insensitive) + same contact number
    const namePattern = input.fullName.replace(/[\\%_]/g, (c) => `\\${c}`);
    const { count: duplicateCount } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", input.eventId)
      .ilike("full_name", namePattern)
      .eq("phone_number", input.phoneNumber)
      .neq("status", "cancelled");

    if (duplicateCount && duplicateCount > 0) {
      return {
        success: false,
        error: "You are already registered for this event with this name and contact number.",
      };
    }

    // 3. Capacity check (a database trigger enforces this again)
    const { count: currentTotal } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", input.eventId)
      .neq("status", "cancelled");

    if (currentTotal !== null && currentTotal >= event.capacity) {
      return { success: false, error: "Event capacity has been reached. Registrations are now full." };
    }

    // 4. Insert registration with an unguessable ticket code
    const ticketCode = generateTicketCode();
    const { data: registration, error: insertError } = await admin
      .from("registrations")
      .insert({
        event_id: input.eventId,
        full_name: input.fullName,
        facebook_profile: input.facebookProfile,
        age: input.age,
        phone_number: input.phoneNumber,
        barangay: input.barangay,
        city: input.city,
        emergency_contact_name: input.emergencyContactName,
        emergency_contact_number: input.emergencyContactNumber,
        house_rules_accepted: true,
        privacy_accepted: true,
        consent_at: new Date().toISOString(),
        ticket_code: ticketCode,
        status: "confirmed",
      })
      .select("ticket_code, full_name, status")
      .single();

    if (insertError || !registration) {
      console.error("Database insert error:", insertError);
      if (insertError?.code === "23505") {
        return {
          success: false,
          error: "You are already registered for this event with this name and contact number.",
        };
      }
      if (insertError?.message?.toLowerCase().includes("capacity")) {
        return { success: false, error: "Event capacity has been reached. Registrations are now full." };
      }
      return { success: false, error: "Failed to process registration. Please try again." };
    }

    const ticket = await buildTicket(registration, event);
    return { success: true, ticket };
  },

  /**
   * Public ticket lookup. Returns ONLY ticket id, QR, attendee name, event info and status.
   */
  async getTicketByCode(ticketCode: string): Promise<DigitalTicketPayload | null> {
    if (!isWellFormedTicketCode(ticketCode)) return null;

    const admin = createAdminClient();
    const { data: registration, error } = await admin
      .from("registrations")
      .select(`
        ticket_code,
        full_name,
        status,
        event:events(title, event_date, venue_name, venue_address)
      `)
      .eq("ticket_code", ticketCode)
      .maybeSingle();

    if (error || !registration || !registration.event) return null;

    const event = registration.event as unknown as {
      title: string;
      event_date: string;
      venue_name: string;
      venue_address: string;
    };

    return buildTicket(registration, event);
  },

  /**
   * Admin: Queries registrations with search, event and status filters.
   */
  async getRegistrationsAdmin(params?: RegistrationFilters): Promise<AdminRegistrationRow[]> {
    const admin = createAdminClient();

    let query = admin.from("registrations").select(ADMIN_SELECT).order("created_at", { ascending: false });

    if (params?.eventId) query = query.eq("event_id", params.eventId);
    if (params?.status && params.status !== "all") query = query.eq("status", params.status);

    const term = params?.search ? sanitizeSearchTerm(params.search) : "";
    if (term) {
      const s = `%${term}%`;
      query = query.or(
        `full_name.ilike.${s},phone_number.ilike.${s},ticket_code.ilike.${s},barangay.ilike.${s}`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching registrations:", error);
      return [];
    }

    return ((data as any[]) || []).map((r) => ({
      ...r,
      event_title: (r.event as unknown as { title: string })?.title || "Unknown Event",
    }));
  },

  /**
   * Admin: Check in an attendee by ticket code.
   */
  async checkInAttendee(ticketCode: string): Promise<{ success: boolean; message: string }> {
    const admin = createAdminClient();

    const { data: registration, error: findError } = await admin
      .from("registrations")
      .select("id, full_name, status, checked_in_at")
      .eq("ticket_code", ticketCode)
      .maybeSingle();

    if (findError || !registration) {
      return { success: false, message: "Invalid ticket code. Not found in system." };
    }
    if (registration.status === "checked_in") {
      return {
        success: false,
        message: `Already checked in at ${new Date(registration.checked_in_at!).toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" })}`,
      };
    }
    if (registration.status === "cancelled") {
      return { success: false, message: "Ticket is VOID or CANCELLED." };
    }

    const { error: updateError } = await admin
      .from("registrations")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("id", registration.id);

    if (updateError) return { success: false, message: "Failed to update check-in status." };
    return { success: true, message: `Checked in successfully: ${registration.full_name}` };
  },

  /**
   * Admin: Deletes a registration permanently.
   */
  async deleteRegistration(id: string): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { error } = await admin.from("registrations").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Admin: Exports registrations as CSV (formula-injection safe, see lib/utils/csv.ts).
   */
  async exportCsvString(params?: RegistrationFilters): Promise<string> {
    const rows = await this.getRegistrationsAdmin(params);

    const headers = [
      "Registration ID",
      "Event Title",
      "Ticket Code",
      "Full Name",
      "Facebook Profile",
      "Age",
      "Contact Number",
      "Barangay",
      "City",
      "Emergency Contact",
      "Emergency Contact Number",
      "House Rules Accepted",
      "Privacy Accepted",
      "Consent At",
      "Status",
      "Checked In At",
      "Registered At",
    ];

    const lines = rows.map((r) => [
      r.id,
      r.event_title,
      r.ticket_code,
      r.full_name,
      r.facebook_profile,
      r.age,
      r.phone_number,
      r.barangay,
      r.city,
      r.emergency_contact_name,
      r.emergency_contact_number,
      r.house_rules_accepted ? "Yes" : "No",
      r.privacy_accepted ? "Yes" : "No",
      r.consent_at,
      r.status,
      r.checked_in_at,
      r.created_at,
    ]);

    return toCsv(headers, lines);
  },
};
