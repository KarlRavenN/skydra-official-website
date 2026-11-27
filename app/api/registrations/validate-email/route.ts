import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { badJsonResponse, readJson } from "@/lib/utils/api";
import { verifyEmailDomainServer } from "@/lib/utils/email-mx";

const schema = z.object({
  email: z.string().trim().min(1, "Email address is required").max(254),
});

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const result = await verifyEmailDomainServer(parsed.data.email);
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch {
    return NextResponse.json({ valid: true });
  }
}
