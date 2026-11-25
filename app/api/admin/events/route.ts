import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/events";
import { eventFormSchema } from "@/types/events";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, readJson, validationErrorResponse } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = eventFormSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await EventService.createEvent(parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, event: result.event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
