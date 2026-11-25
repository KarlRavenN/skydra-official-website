import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/events";
import { eventUpdateSchema } from "@/types/events";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, isUuid, readJson, validationErrorResponse } from "@/lib/utils/api";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid event id" }, { status: 400 });

  const result = await EventService.deleteEvent(params.id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid event id" }, { status: 400 });

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await EventService.updateEvent(params.id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
