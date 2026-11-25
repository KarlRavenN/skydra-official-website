import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, readJson, validationErrorResponse } from "@/lib/utils/api";
import { POSTER_BUCKET, POSTER_MAX_BYTES, POSTER_MIME_TO_EXT } from "@/lib/utils/poster-storage";

/**
 * Issues a one-time SIGNED UPLOAD URL so the browser can upload the poster
 * straight to Supabase Storage. The file itself never passes through this
 * server (Vercel limits request bodies to ~4.5 MB).
 *
 * The original file name is never used: the path is always events/<uuid>.<ext>
 * derived from the validated MIME type.
 */
const bodySchema = z.object({
  contentType: z.string().refine((v) => v in POSTER_MIME_TO_EXT, "Only JPG, PNG or WebP images are allowed"),
  size: z
    .number()
    .int()
    .positive("The file is empty")
    .max(POSTER_MAX_BYTES, "Image is too large. Maximum size is 8 MB"),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const ext = POSTER_MIME_TO_EXT[parsed.data.contentType];
    const path = `events/${crypto.randomUUID()}.${ext}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(POSTER_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("createSignedUploadUrl failed:", error);
      return NextResponse.json({ success: false, error: "Could not prepare the upload. Try again." }, { status: 500 });
    }

    const { data: publicData } = admin.storage.from(POSTER_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      success: true,
      path: data.path,
      token: data.token,
      publicUrl: publicData.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Upload preparation failed" }, { status: 500 });
  }
}
