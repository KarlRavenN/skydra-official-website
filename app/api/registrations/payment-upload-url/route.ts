import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { badJsonResponse, readJson, validationErrorResponse } from "@/lib/utils/api";
import { POSTER_MAX_BYTES, POSTER_MIME_TO_EXT } from "@/lib/utils/poster-storage";

export const PAYMENT_SCREENSHOT_BUCKET = "payment-screenshots";

const bodySchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID"),
  contentType: z
    .string()
    .refine((v) => v in POSTER_MIME_TO_EXT, "Only JPG, PNG or WebP images are allowed"),
  size: z
    .number()
    .int()
    .positive("The file is empty")
    .max(POSTER_MAX_BYTES, "Screenshot is too large. Maximum size is 8 MB"),
});

/**
 * Issues a one-time signed upload URL for an attendee's GCash payment screenshot.
 * Verifies the registration exists and is awaiting payment verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const admin = createAdminClient();
    const { data: reg, error: regError } = await admin
      .from("registrations")
      .select("id, payment_status, status")
      .eq("id", parsed.data.registrationId)
      .single();

    if (regError || !reg) {
      return NextResponse.json(
        { success: false, error: "Registration record not found." },
        { status: 404 }
      );
    }

    if (reg.payment_status === "approved" || reg.status === "confirmed") {
      return NextResponse.json(
        { success: false, error: "This registration has already been approved." },
        { status: 400 }
      );
    }

    const ext = POSTER_MIME_TO_EXT[parsed.data.contentType];
    const path = `${parsed.data.registrationId}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await admin.storage
      .from(PAYMENT_SCREENSHOT_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("createSignedUploadUrl (payment-screenshots) failed:", error);
      return NextResponse.json(
        { success: false, error: "Could not prepare screenshot upload. Please try again." },
        { status: 500 }
      );
    }

    const { data: publicData } = admin.storage
      .from(PAYMENT_SCREENSHOT_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      bucket: PAYMENT_SCREENSHOT_BUCKET,
      path: data.path,
      token: data.token,
      publicUrl: publicData.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Upload preparation failed" },
      { status: 500 }
    );
  }
}
