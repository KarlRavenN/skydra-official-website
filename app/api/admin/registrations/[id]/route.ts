import { NextRequest, NextResponse } from "next/server";
import { RegistrationService } from "@/services/registrations";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { isUuid } from "@/lib/utils/api";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) {
    return NextResponse.json({ success: false, error: "Invalid registration id" }, { status: 400 });
  }

  const result = await RegistrationService.deleteRegistration(params.id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
