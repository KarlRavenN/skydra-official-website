import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminService } from "@/services/admin";
import { requireAdminApi } from "@/lib/supabase/auth-guard";
import { badJsonResponse, readJson, validationErrorResponse } from "@/lib/utils/api";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .default("")
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Social links must start with http:// or https://");

const settingsSchema = z.object({
  leagueName: z.string().trim().min(1, "League name is required").max(150),
  leagueTagline: z.string().trim().max(300).optional().default(""),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  facebook: optionalUrl,
  youtube: optionalUrl,
  instagram: optionalUrl,
  tiktok: optionalUrl,
  houseRules: z.string().max(10000).optional().default(""),
  privacyPolicy: z.string().max(30000).optional().default(""),
});

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);
    const s = parsed.data;

    const rules = s.houseRules
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const results = await Promise.all([
      AdminService.updateSetting("league_info", {
        name: s.leagueName,
        tagline: s.leagueTagline,
        contactEmail: s.contactEmail,
      }),
      AdminService.updateSetting("social_links", {
        facebook: s.facebook,
        youtube: s.youtube,
        instagram: s.instagram,
        tiktok: s.tiktok,
      }),
      AdminService.updateSetting("house_rules", { rules }),
      AdminService.updateSetting("privacy_policy", { text: s.privacyPolicy.trim() }),
    ]);

    const failed = results.find((r) => !r.success);
    if (failed) return NextResponse.json({ success: false, error: failed.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
