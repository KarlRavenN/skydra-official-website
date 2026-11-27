import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RegistrationService } from "@/services/registrations";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, isUuid, readJson, validationErrorResponse } from "@/lib/utils/api";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  if (!isUuid(params.id)) {
    return NextResponse.json({ success: false, error: "Invalid registration id" }, { status: 400 });
  }

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await RegistrationService.reviewPayment(
      params.id,
      parsed.data.action,
      parsed.data.reason
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to review payment" },
      { status: 500 }
    );
  }
}
