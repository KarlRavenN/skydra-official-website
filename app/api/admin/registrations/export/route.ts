import { NextRequest, NextResponse } from "next/server";
import { RegistrationService } from "@/services/registrations";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { isUuid } from "@/lib/utils/api";
import { AttendeeStatus } from "@/types/database";

const STATUSES = ["pending", "confirmed", "checked_in", "cancelled"];

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get("eventId") || undefined;
    const statusParam = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const eventId = eventIdParam && isUuid(eventIdParam) ? eventIdParam : undefined;
    const status = statusParam && STATUSES.includes(statusParam) ? (statusParam as AttendeeStatus) : undefined;

    const csvContent = await RegistrationService.exportCsvString({ eventId, status, search });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="skydra-registrations-${Date.now()}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
