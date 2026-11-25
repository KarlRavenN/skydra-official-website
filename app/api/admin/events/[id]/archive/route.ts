import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/events";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { isUuid } from "@/lib/utils/api";

/** Archive = status "past" + registration closed. Archived events show under Past Events. */
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid event id" }, { status: 400 });

  const result = await EventService.archiveEvent(params.id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
