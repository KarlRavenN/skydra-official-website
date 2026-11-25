import { z } from "zod";
import { Database, BattleType } from "./database";
import { parseYouTubeUrl } from "@/lib/utils/youtube";

export type BattleRow = Database["public"]["Tables"]["battles"]["Row"];
export type BattleInsert = Database["public"]["Tables"]["battles"]["Insert"];
export type BattleUpdate = Database["public"]["Tables"]["battles"]["Update"];

export const BATTLE_TYPE_LABELS: Record<BattleType, string> = {
  tournament: "Tournament",
  non_tournament: "Non-Tournament",
};

/** A battle plus the (optional) event it happened at. */
export interface BattleWithEvent extends BattleRow {
  event: { id: string; title: string; slug: string } | null;
}

/** Event entry shown in the "Battle Events" list on /battles. */
export interface BattleEventSummary {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  event_date: string;
  battleCount: number;
}

export interface BattleListResult {
  battles: BattleWithEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Validation for admin create/edit. The video id is derived on the server from the URL. */
export const battleFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  youtube_url: z
    .string()
    .trim()
    .min(1, "YouTube URL is required")
    .refine((v) => parseYouTubeUrl(v) !== null, "Enter a valid YouTube video link"),
  event_id: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v || null),
  battle_type: z.enum(["tournament", "non_tournament"]),
  battle_date: z
    .string()
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
  is_published: z.boolean(),
});

export const battleUpdateSchema = battleFormSchema.partial();

export type BattleFormInput = z.input<typeof battleFormSchema>;
