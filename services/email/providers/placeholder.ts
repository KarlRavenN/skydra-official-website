import crypto from "crypto";
import { EmailMessage, EmailProvider, EmailSendResult } from "../types";

/**
 * Placeholder email provider used until a real transactional provider
 * (e.g. Resend) is configured. Simulates successful delivery so the
 * complete ticketing flow operates end-to-end without blocking.
 */
export class PlaceholderEmailProvider implements EmailProvider {
  readonly name = "placeholder";

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const messageId = `placeholder-${crypto.randomUUID()}`;

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[EmailService:placeholder] To=${message.to} Subject="${message.subject}" MessageId=${messageId}`
      );
    }

    return {
      success: true,
      messageId,
      provider: this.name,
    };
  }
}
