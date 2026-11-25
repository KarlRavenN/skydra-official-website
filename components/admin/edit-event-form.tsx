"use client";

import React from "react";
import { EventRow } from "@/types/events";
import { EventForm } from "@/components/admin/event-form";

/** Kept as a named wrapper so existing imports keep working. */
export function EditEventForm({ event }: { event: EventRow }) {
  return <EventForm event={event} />;
}
