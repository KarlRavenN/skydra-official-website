import { createAdminClient } from "@/lib/supabase/admin";
import { generateTicketCode, generateTicketQRCode, isWellFormedTicketCode } from "@/lib/utils/ticket";
import { toCsv, sanitizeSearchTerm } from "@/lib/utils/csv";
import { verifyEmailDomainServer } from "@/lib/utils/email-mx";
import { EmailService } from "@/services/email";
import {
  registrationFormSchema,
  paymentSubmissionSchema,
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
  email,
  facebook_profile,
  age,
  phone_number,
  house_rules_accepted,
  privacy_accepted,
  consent_at,
  ticket_code,
  status,
  payment_status,
  payment_reference,
  payment_screenshot_url,
  payment_submitted_at,
  payment_reviewed_at,
  payment_rejection_reason,
  checked_in_at,
  created_at,
  event:events(title, ticket_price)
`;

export type AdminRegistrationRow = RegistrationRow & {
  event_title: string;
  event_ticket_price: number;
};

async function buildTicket(
  registration: {
    ticket_code: string;
    full_name: string;
    status: RegistrationRow["status"];
    payment_status?: RegistrationRow["payment_status"];
  },
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
    paymentStatus: registration.payment_status,
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
   * Registers a guest for an event: validates input & email MX domain, verifies
   * event state, capacity and duplicates, creates the registration, and either:
   * - Free ticket: confirms immediately, issues digital ticket, invokes placeholder EmailService.
   * - Paid ticket: creates pending_verification registration and returns registrationId for payment proof.
   */
  async registerAttendee(rawInput: unknown): Promise<{
    success: boolean;
    requiresPayment?: boolean;
    registrationId?: string;
    ticketCode?: string;
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

    // Server-side MX / domain check
    const emailCheck = await verifyEmailDomainServer(input.email);
    if (!emailCheck.valid) {
      return {
        success: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: { email: emailCheck.error || "Please enter a valid email address" },
      };
    }

    const admin = createAdminClient();

    // 1. Event state
    const { data: event, error: eventError } = await admin
      .from("events")
      .select(
        "id, title, event_date, venue_name, venue_address, ticket_price, capacity, status, registration_status"
      )
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

    const isPaidEvent = Number(event.ticket_price) > 0;
    const ticketCode = generateTicketCode();

    // 4. Insert registration with an unguessable ticket code
    const { data: registration, error: insertError } = await admin
      .from("registrations")
      .insert({
        event_id: input.eventId,
        full_name: input.fullName,
        email: input.email,
        facebook_profile: input.facebookProfile,
        age: input.age,
        phone_number: input.phoneNumber,
        house_rules_accepted: true,
        privacy_accepted: true,
        consent_at: new Date().toISOString(),
        ticket_code: ticketCode,
        status: isPaidEvent ? "pending" : "confirmed",
        payment_status: isPaidEvent ? "pending_verification" : "free",
      })
      .select("id, ticket_code, full_name, status, payment_status")
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

    if (isPaidEvent) {
      return {
        success: true,
        requiresPayment: true,
        registrationId: registration.id,
        ticketCode: registration.ticket_code,
      };
    }

    const ticket = await buildTicket(registration, event);
    const ticketUrl = `${env.NEXT_PUBLIC_SITE_URL}/tickets/${registration.ticket_code}`;

    // Automatically invoke placeholder Email Service for FREE tickets
    await EmailService.sendFreeTicketEmail(input.email, {
      attendeeName: registration.full_name,
      eventTitle: event.title,
      eventDate: event.event_date,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
      ticketCode: registration.ticket_code,
      ticketUrl,
    });

    return { success: true, requiresPayment: false, ticket };
  },

  /**
   * Attaches GCash payment proof (reference number + screenshot URL) to a pending paid registration
   * and triggers the placeholder "Payment Received" email.
   */
  async submitPaymentProof(rawInput: unknown): Promise<{ success: boolean; error?: string }> {
    const parsed = paymentSubmissionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid payment submission details.",
      };
    }
    const { registrationId, paymentReference, paymentScreenshotUrl } = parsed.data;
    const admin = createAdminClient();

    const { data: existing, error: fetchError } = await admin
      .from("registrations")
      .select("id, full_name, email, status, payment_status, event:events(title, ticket_price)")
      .eq("id", registrationId)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Registration record not found." };
    }
    if (existing.payment_status === "approved" || existing.status === "confirmed") {
      return { success: false, error: "This registration has already been approved." };
    }
    if (existing.status === "cancelled") {
      return { success: false, error: "This registration has been cancelled." };
    }

    const { error: updateError } = await admin
      .from("registrations")
      .update({
        payment_status: "pending_verification",
        payment_reference: paymentReference,
        payment_screenshot_url: paymentScreenshotUrl,
        payment_submitted_at: new Date().toISOString(),
        payment_rejection_reason: null,
      })
      .eq("id", registrationId);

    if (updateError) {
      console.error("Failed to update payment proof:", updateError);
      return { success: false, error: "Failed to save payment submission. Please try again." };
    }

    const eventInfo = existing.event as unknown as { title: string; ticket_price: number } | null;

    await EmailService.sendPaymentReceivedEmail(existing.email, {
      attendeeName: existing.full_name,
      eventTitle: eventInfo?.title || "SKYDRA Event",
      referenceNumber: paymentReference,
      amount: Number(eventInfo?.ticket_price ?? 0),
    });

    return { success: true };
  },

  /**
   * Admin: Approves or rejects a paid registration's payment proof.
   * On approval, confirms the registration and sends the placeholder Approval Email.
   */
  async reviewPayment(
    registrationId: string,
    action: "approve" | "reject",
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();

    const { data: existing, error: fetchError } = await admin
      .from("registrations")
      .select(
        "id, full_name, email, ticket_code, status, payment_status, event:events(title, event_date, venue_name, venue_address)"
      )
      .eq("id", registrationId)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Registration not found." };
    }

    const now = new Date().toISOString();

    if (action === "approve") {
      const { error: updateError } = await admin
        .from("registrations")
        .update({
          payment_status: "approved",
          status: existing.status === "checked_in" ? "checked_in" : "confirmed",
          payment_reviewed_at: now,
          payment_rejection_reason: null,
        })
        .eq("id", registrationId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      const eventInfo = existing.event as unknown as {
        title: string;
        event_date: string;
        venue_name: string;
        venue_address: string;
      } | null;

      if (eventInfo) {
        const ticketUrl = `${env.NEXT_PUBLIC_SITE_URL}/tickets/${existing.ticket_code}`;
        await EmailService.sendTicketApprovedEmail(existing.email, {
          attendeeName: existing.full_name,
          eventTitle: eventInfo.title,
          eventDate: eventInfo.event_date,
          venueName: eventInfo.venue_name,
          venueAddress: eventInfo.venue_address,
          ticketCode: existing.ticket_code,
          ticketUrl,
        });
      }

      return { success: true };
    }

    // Reject
    const { error: rejectError } = await admin
      .from("registrations")
      .update({
        payment_status: "rejected",
        status: "cancelled",
        payment_reviewed_at: now,
        payment_rejection_reason: reason?.trim() || null,
      })
      .eq("id", registrationId);

    if (rejectError) {
      return { success: false, error: rejectError.message };
    }

    return { success: true };
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
        payment_status,
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
   * Admin: Queries registrations with search, event, status, and payment status filters.
   */
  async getRegistrationsAdmin(params?: RegistrationFilters): Promise<AdminRegistrationRow[]> {
    const admin = createAdminClient();

    let query = admin
      .from("registrations")
      .select(ADMIN_SELECT)
      .order("created_at", { ascending: false });

    if (params?.eventId) query = query.eq("event_id", params.eventId);
    if (params?.status && params.status !== "all") query = query.eq("status", params.status);
    if (params?.paymentStatus && params.paymentStatus !== "all") {
      query = query.eq("payment_status", params.paymentStatus);
    }

    const term = params?.search ? sanitizeSearchTerm(params.search) : "";
    if (term) {
      const s = `%${term}%`;
      query = query.or(
        `full_name.ilike.${s},email.ilike.${s},phone_number.ilike.${s},ticket_code.ilike.${s},payment_reference.ilike.${s}`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching registrations:", error);
      return [];
    }

    return ((data as any[]) || []).map((r) => ({
      ...r,
      event_title: (r.event as unknown as { title: string; ticket_price?: number })?.title || "Unknown Event",
      event_ticket_price: Number(
        (r.event as unknown as { title: string; ticket_price?: number })?.ticket_price ?? 0
      ),
    }));
  },

  /**
   * Admin: Check in an attendee by ticket code.
   */
  async checkInAttendee(ticketCode: string): Promise<{ success: boolean; message: string }> {
    const admin = createAdminClient();

    const { data: registration, error: findError } = await admin
      .from("registrations")
      .select("id, full_name, status, payment_status, checked_in_at")
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
    if (registration.status === "cancelled" || registration.payment_status === "rejected") {
      return { success: false, message: "Ticket is VOID, REJECTED, or CANCELLED." };
    }
    if (registration.payment_status === "pending_verification") {
      return {
        success: false,
        message: "Payment is still pending staff verification. Approve payment before check-in.",
      };
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
      "Email",
      "Facebook Profile",
      "Age",
      "Contact Number",
      "Payment Status",
      "Payment Reference",
      "Payment Screenshot URL",
      "Payment Submitted At",
      "Payment Reviewed At",
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
      r.email,
      r.facebook_profile,
      r.age,
      r.phone_number,
      r.payment_status,
      r.payment_reference,
      r.payment_screenshot_url,
      r.payment_submitted_at,
      r.payment_reviewed_at,
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
