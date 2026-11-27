import { NextRequest, NextResponse } from "next/server";
import { RegistrationService } from "@/services/registrations";
import { badJsonResponse, readJson } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    if (body === undefined) return badJsonResponse();

    const result = await RegistrationService.registerAttendee(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, fieldErrors: result.fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresPayment: result.requiresPayment ?? false,
        registrationId: result.registrationId,
        ticketCode: result.ticketCode,
        ticket: result.ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error in POST /api/registrations:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
