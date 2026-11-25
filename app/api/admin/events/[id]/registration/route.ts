import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventService } from "@/services/events";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, isUuid, readJson, validationErrorResponse } from "@/lib/utils/api";

const bodySchema = z.object({ registration_status: z.enum(["open", "closed", "paused"]) });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid event id" }, { status: 400 });

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await EventService.setRegistrationStatus(params.id, parsed.data.registration_status);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
