import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Standard 400 response for zod validation failures: one readable message + per-field map. */
export function validationErrorResponse(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  const first = error.issues[0];
  return NextResponse.json(
    { success: false, error: first?.message || "Invalid input", fieldErrors },
    { status: 400 }
  );
}

export function badJsonResponse() {
  return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
}

export async function readJson(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
