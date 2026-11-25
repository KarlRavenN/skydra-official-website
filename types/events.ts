import { z } from "zod";
import { Database, EventStatus, RegistrationStatus } from "./database";
import { BattleWithEvent } from "./battles";
import { fromManilaDateTimeLocal } from "@/lib/utils/formatters";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

/**
 * Event detail model: the event plus its published battles (YouTube videos)
 * and its live registration count (used to hide Register when the event is full).
 */
export interface EventWithBattles extends EventRow {
  battles: BattleWithEvent[];
  registrationCount: number;
}

/**
 * Filter options for public event catalog
 */
export interface EventCatalogFilters {
  tab?: "upcoming" | "past" | "all";
  search?: string;
}

/**
 * Form payload for creating/editing events in the Admin portal.
 * Dates are datetime-local strings ("YYYY-MM-DDTHH:mm") that mean Asia/Manila time.
 */
export interface EventFormData {
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  event_date: string;
  doors_open_time: string;
  venue_name: string;
  venue_address: string;
  google_maps_url: string;
  ticket_price: number;
  capacity: number;
  status: EventStatus;
  registration_status: RegistrationStatus;
  is_featured: boolean;
}

const manilaDateTime = z
  .string()
  .min(1, "Date and time is required")
  .transform((value, ctx) => {
    const iso = fromManilaDateTimeLocal(value);
    if (!iso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date and time" });
      return z.NEVER;
    }
    return iso;
  });

const optionalManilaDateTime = z
  .string()
  .nullish()
  .transform((value, ctx) => {
    if (!value) return null;
    const iso = fromManilaDateTimeLocal(value);
    if (!iso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid doors open time" });
      return z.NEVER;
    }
    return iso;
  });

const optionalHttpUrl = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "Must start with http:// or https://");

export const eventFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and dashes"),
  description: z.string().max(5000).nullish().transform((v) => v || null),
  poster_url: optionalHttpUrl,
  event_date: manilaDateTime,
  doors_open_time: optionalManilaDateTime,
  venue_name: z.string().trim().min(2, "Venue name is required").max(200),
  venue_address: z.string().trim().min(2, "Venue address is required").max(300),
  google_maps_url: optionalHttpUrl,
  ticket_price: z.coerce.number().min(0, "Price cannot be negative").max(1_000_000),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(100_000),
  status: z.enum(["draft", "published", "live", "past", "cancelled"]),
  registration_status: z.enum(["open", "closed", "paused"]),
  is_featured: z.boolean(),
});

export const eventUpdateSchema = eventFormSchema.partial();

export type EventFormInput = z.infer<typeof eventFormSchema>;
