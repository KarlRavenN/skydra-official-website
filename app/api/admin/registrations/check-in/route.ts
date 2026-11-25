import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RegistrationService } from "@/services/registrations";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { readJson } from "@/lib/utils/api";

const bodySchema = z.object({ ticketCode: z.string().trim().min(1).max(100) });

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Ticket code required" }, { status: 400 });
    }

    const result = await RegistrationService.checkInAttendee(parsed.data.ticketCode);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
