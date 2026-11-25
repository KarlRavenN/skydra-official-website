import { NextRequest, NextResponse } from "next/server";
import { BattleService } from "@/services/battles";
import { battleFormSchema } from "@/types/battles";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, readJson, validationErrorResponse } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = battleFormSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const result = await BattleService.createBattle(parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, battle: result.battle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to create battle" }, { status: 500 });
  }
}
