import { NextRequest, NextResponse } from "next/server";
import { BattleService } from "@/services/battles";
import { battleUpdateSchema } from "@/types/battles";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, isUuid, readJson, validationErrorResponse } from "@/lib/utils/api";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid battle id" }, { status: 400 });

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = battleUpdateSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await BattleService.updateBattle(params.id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  if (!isUuid(params.id)) return NextResponse.json({ success: false, error: "Invalid battle id" }, { status: 400 });

  const result = await BattleService.deleteBattle(params.id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
