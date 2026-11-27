import { formatDateTime, formatCurrency } from "@/lib/utils/formatters";

export interface RenderedEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapHtmlLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#121215;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #27272a;background:linear-gradient(90deg,#450a0a,#18181b,#09090b);">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#e11d48;">
                SKYDRA RAP BATTLE LEAGUE
              </div>
              <h1 style="margin:6px 0 0;font-size:20px;font-weight:900;letter-spacing:0.04em;color:#ffffff;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-size:14px;line-height:1.65;color:#e4e4e7;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid #27272a;background-color:#09090b;font-size:12px;color:#a1a1aa;">
              SKYDRA Official Ticketing System &bull; Please check your Inbox and Spam folder for updates.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface FreeTicketEmailParams {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  ticketCode: string;
  ticketUrl: string;
}

export function buildFreeTicketEmail(params: FreeTicketEmailParams): RenderedEmailTemplate {
  const subject = `Your SKYDRA Ticket is Ready — ${params.eventTitle}`;
  const formattedDate = formatDateTime(params.eventDate);

  const text = [
    `Hi ${params.attendeeName},`,
    "",
    `Your registration for ${params.eventTitle} is confirmed.`,
    "",
    `Ticket Code: ${params.ticketCode}`,
    `Date & Time: ${formattedDate}`,
    `Venue: ${params.venueName} (${params.venueAddress})`,
    `Digital Pass: ${params.ticketUrl}`,
    "",
    "Please bring:",
    "- this ticket",
    "- one valid government ID",
    "",
    "Please check your Inbox and Spam folder if you don't immediately receive our email.",
    "",
    "See you at the event.",
  ].join("\n");

  const html = wrapHtmlLayout(
    "Your SKYDRA Ticket is Ready",
    `
      <p style="margin-top:0;">Hi <strong>${escapeHtml(params.attendeeName)}</strong>,</p>
      <p>Your registration for <strong>${escapeHtml(params.eventTitle)}</strong> is confirmed.</p>
      <div style="margin:20px 0;padding:16px;border-radius:8px;background-color:#18181b;border:1px solid #27272a;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#a1a1aa;">Ticket Code</div>
        <div style="font-family:monospace;font-size:18px;font-weight:800;color:#e11d48;margin-top:4px;">${escapeHtml(params.ticketCode)}</div>
        <div style="margin-top:12px;font-size:13px;color:#d4d4d8;">
          <strong>Date:</strong> ${escapeHtml(formattedDate)}<br/>
          <strong>Venue:</strong> ${escapeHtml(params.venueName)}<br/>
          <span style="color:#a1a1aa;">${escapeHtml(params.venueAddress)}</span>
        </div>
      </div>
      <p>Please bring:</p>
      <ul style="padding-left:20px;margin:8px 0 18px;">
        <li>this ticket</li>
        <li>one valid government ID</li>
      </ul>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(params.ticketUrl)}" style="display:inline-block;padding:12px 20px;background-color:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;">
          View Digital Ticket
        </a>
      </p>
      <p style="margin-bottom:0;">See you at the event.</p>
    `
  );

  return { subject, text, html };
}

export interface PaymentReceivedEmailParams {
  attendeeName: string;
  eventTitle: string;
  referenceNumber: string;
  amount: number;
}

export function buildPaymentReceivedEmail(params: PaymentReceivedEmailParams): RenderedEmailTemplate {
  const subject = "SKYDRA Ticket Payment Received";
  const formattedAmount = formatCurrency(params.amount);

  const text = [
    "Thank you for registering.",
    "",
    "We have received your payment submission.",
    "",
    `Event: ${params.eventTitle}`,
    `Amount: ${formattedAmount}`,
    `GCash Reference Number: ${params.referenceNumber}`,
    "",
    "Our staff is currently verifying your payment.",
    "",
    "Once approved, your official event ticket will automatically be emailed to you.",
    "",
    "If you have questions, contact us through our Facebook Page.",
    "",
    "Please also check your Spam folder if you don't receive future emails.",
  ].join("\n");

  const html = wrapHtmlLayout(
    subject,
    `
      <p style="margin-top:0;">Hi <strong>${escapeHtml(params.attendeeName)}</strong>,</p>
      <p>Thank you for registering.</p>
      <p>We have received your payment submission.</p>
      <div style="margin:20px 0;padding:16px;border-radius:8px;background-color:#18181b;border:1px solid #27272a;font-size:13px;">
        <div><strong>Event:</strong> ${escapeHtml(params.eventTitle)}</div>
        <div style="margin-top:6px;"><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</div>
        <div style="margin-top:6px;"><strong>Reference Number:</strong> <span style="font-family:monospace;">${escapeHtml(params.referenceNumber)}</span></div>
      </div>
      <p>Our staff is currently verifying your payment.</p>
      <p>Once approved, your official event ticket will automatically be emailed to you.</p>
      <p>If you have questions, contact us through our Facebook Page.</p>
      <p style="margin-bottom:0;color:#a1a1aa;">Please also check your Spam folder if you don't receive future emails.</p>
    `
  );

  return { subject, text, html };
}

export interface TicketApprovedEmailParams {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  ticketCode: string;
  ticketUrl: string;
}

export function buildTicketApprovedEmail(params: TicketApprovedEmailParams): RenderedEmailTemplate {
  const subject = "Your SKYDRA Ticket is Ready";
  const formattedDate = formatDateTime(params.eventDate);

  const text = [
    "Your payment has been verified.",
    "",
    "Attached is your official SKYDRA event ticket.",
    "",
    `Event: ${params.eventTitle}`,
    `Ticket Code: ${params.ticketCode}`,
    `Date & Time: ${formattedDate}`,
    `Venue: ${params.venueName} (${params.venueAddress})`,
    `Digital Pass: ${params.ticketUrl}`,
    "",
    "Please bring:",
    "",
    "- this ticket",
    "- one valid government ID",
    "",
    "See you at the event.",
  ].join("\n");

  const html = wrapHtmlLayout(
    subject,
    `
      <p style="margin-top:0;">Hi <strong>${escapeHtml(params.attendeeName)}</strong>,</p>
      <p>Your payment has been verified.</p>
      <p>Attached is your official SKYDRA event ticket.</p>
      <div style="margin:20px 0;padding:16px;border-radius:8px;background-color:#18181b;border:1px solid #27272a;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#a1a1aa;">Ticket Code</div>
        <div style="font-family:monospace;font-size:18px;font-weight:800;color:#e11d48;margin-top:4px;">${escapeHtml(params.ticketCode)}</div>
        <div style="margin-top:12px;font-size:13px;color:#d4d4d8;">
          <strong>Event:</strong> ${escapeHtml(params.eventTitle)}<br/>
          <strong>Date:</strong> ${escapeHtml(formattedDate)}<br/>
          <strong>Venue:</strong> ${escapeHtml(params.venueName)}<br/>
          <span style="color:#a1a1aa;">${escapeHtml(params.venueAddress)}</span>
        </div>
      </div>
      <p>Please bring:</p>
      <ul style="padding-left:20px;margin:8px 0 18px;">
        <li>this ticket</li>
        <li>one valid government ID</li>
      </ul>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(params.ticketUrl)}" style="display:inline-block;padding:12px 20px;background-color:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;border-radius:6px;">
          View Digital Ticket
        </a>
      </p>
      <p style="margin-bottom:0;">See you at the event.</p>
    `
  );

  return { subject, text, html };
}
