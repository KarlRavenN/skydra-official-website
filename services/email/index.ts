import { PlaceholderEmailProvider } from "./providers/placeholder";
import {
  buildFreeTicketEmail,
  buildPaymentReceivedEmail,
  buildTicketApprovedEmail,
  FreeTicketEmailParams,
  PaymentReceivedEmailParams,
  TicketApprovedEmailParams,
} from "./templates";
import { EmailProvider, EmailSendResult } from "./types";

/**
 * Resolves the active email provider.
 * When integrating Resend or another provider later, instantiate it here
 * (e.g. based on process.env.RESEND_API_KEY) without changing any callers.
 */
function getEmailProvider(): EmailProvider {
  return new PlaceholderEmailProvider();
}

export const EmailService = {
  async sendFreeTicketEmail(to: string, params: FreeTicketEmailParams): Promise<EmailSendResult> {
    const provider = getEmailProvider();
    const template = buildFreeTicketEmail(params);
    return provider.send({
      to,
      ...template,
      tags: { type: "free_ticket", ticketCode: params.ticketCode },
    });
  },

  async sendPaymentReceivedEmail(
    to: string,
    params: PaymentReceivedEmailParams
  ): Promise<EmailSendResult> {
    const provider = getEmailProvider();
    const template = buildPaymentReceivedEmail(params);
    return provider.send({
      to,
      ...template,
      tags: { type: "payment_received", referenceNumber: params.referenceNumber },
    });
  },

  async sendTicketApprovedEmail(
    to: string,
    params: TicketApprovedEmailParams
  ): Promise<EmailSendResult> {
    const provider = getEmailProvider();
    const template = buildTicketApprovedEmail(params);
    return provider.send({
      to,
      ...template,
      tags: { type: "ticket_approved", ticketCode: params.ticketCode },
    });
  },
};

export type { EmailProvider, EmailMessage, EmailSendResult } from "./types";
