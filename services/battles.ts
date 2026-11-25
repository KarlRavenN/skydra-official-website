import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseYouTubeUrl } from "@/lib/utils/youtube";
import { sanitizeSearchTerm } from "@/lib/utils/csv";
import {
  BattleEventSummary,
  BattleListResult,
  BattleRow,
  BattleWithEvent,
  battleFormSchema,
  battleUpdateSchema,
} from "@/types/battles";
import { z } from "zod";

export const BATTLES_PAGE_SIZE = 12;
const BATTLE_SELECT = "*, event:events(id, title, slug)";

type BattleFormParsed = z.output<typeof battleFormSchema>;
type BattleUpdateParsed = z.output<typeof battleUpdateSchema>;

function orderedBattles<T extends { order: Function }>(query: T): T {
  return query
    .order("battle_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false }) as T;
}

/**
 * Battles = YouTube battle videos. Public reads use the anon server client
 * (RLS only exposes is_published = true). Admin operations use the service role
 * and are only reachable from admin-guarded routes/pages.
 */
export const BattleService = {
  // ---------------------------------------------------------------- public

  /** Published battles, newest first, optionally filtered by event slug, paginated. */
  async getPublishedBattles(params: { eventSlug?: string; page?: number }): Promise<BattleListResult> {
    const supabase = await createServerSupabase();
    const pageSize = BATTLES_PAGE_SIZE;
    const page = Math.max(1, Math.floor(params.page || 1));
    const empty: BattleListResult = { battles: [], total: 0, page, pageSize, totalPages: 1 };

    let eventId: string | undefined;
    if (params.eventSlug) {
      const { data: event } = await supabase
        .from("events")
        .select("id")
        .eq("slug", params.eventSlug)
        .maybeSingle();
      if (!event) return empty;
      eventId = event.id;
    }

    const from = (page - 1) * pageSize;
    let query = supabase
      .from("battles")
      .select(BATTLE_SELECT, { count: "exact" })
      .eq("is_published", true);
    if (eventId) query = query.eq("event_id", eventId);

    const { data, count, error } = await orderedBattles(query).range(from, from + pageSize - 1);
    if (error) {
      console.error("Error fetching battles:", error);
      return empty;
    }

    const total = count ?? 0;
    return {
      battles: (data as any as BattleWithEvent[]) || [],
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  /** Events that have at least one published battle, newest first. */
  async getEventsWithBattles(): Promise<BattleEventSummary[]> {
    const supabase = await createServerSupabase();

    const { data: rows, error } = await supabase
      .from("battles")
      .select("event_id")
      .eq("is_published", true)
      .not("event_id", "is", null);
    if (error || !rows) return [];

    const counts = new Map<string, number>();
    for (const r of rows as Array<{ event_id: string }>) {
      counts.set(r.event_id, (counts.get(r.event_id) || 0) + 1);
    }
    if (counts.size === 0) return [];

    const { data: events } = await supabase
      .from("events")
      .select("id, title, slug, poster_url, event_date")
      .in("id", Array.from(counts.keys()))
      .order("event_date", { ascending: false });

    return ((events as any[]) || []).map((e) => ({ ...e, battleCount: counts.get(e.id) || 0 }));
  },

  /** Published battles of one event (event detail page). */
  async getPublishedBattlesForEvent(eventId: string): Promise<BattleWithEvent[]> {
    const supabase = await createServerSupabase();
    const query = supabase.from("battles").select(BATTLE_SELECT).eq("is_published", true).eq("event_id", eventId);
    const { data, error } = await orderedBattles(query);
    if (error) {
      console.error("Error fetching event battles:", error);
      return [];
    }
    return (data as any as BattleWithEvent[]) || [];
  },

  // ----------------------------------------------------------------- admin

  async listBattlesAdmin(params: { search?: string; eventId?: string; type?: string }): Promise<BattleWithEvent[]> {
    const admin = createAdminClient();
    let query = admin.from("battles").select(BATTLE_SELECT);

    const search = params.search ? sanitizeSearchTerm(params.search) : "";
    if (search) query = query.ilike("title", `%${search}%`);
    if (params.eventId === "none") query = query.is("event_id", null);
    else if (params.eventId) query = query.eq("event_id", params.eventId);
    if (params.type === "tournament" || params.type === "non_tournament") {
      query = query.eq("battle_type", params.type);
    }

    const { data, error } = await orderedBattles(query);
    if (error) {
      console.error("Error fetching admin battles:", error);
      return [];
    }
    return (data as any as BattleWithEvent[]) || [];
  },

  async getBattleAdmin(id: string): Promise<BattleRow | null> {
    const admin = createAdminClient();
    const { data } = await admin.from("battles").select("*").eq("id", id).maybeSingle();
    return (data as BattleRow) || null;
  },

  async countPublished(): Promise<number> {
    const admin = createAdminClient();
    const { count } = await admin
      .from("battles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);
    return count || 0;
  },

  async createBattle(input: BattleFormParsed): Promise<{ success: boolean; battle?: BattleRow; error?: string }> {
    const parsed = parseYouTubeUrl(input.youtube_url);
    if (!parsed) return { success: false, error: "Enter a valid YouTube video link." };

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("battles")
      .insert({
        title: input.title,
        youtube_url: parsed.normalizedUrl,
        youtube_video_id: parsed.videoId,
        battle_type: input.battle_type,
        event_id: input.event_id,
        battle_date: input.battle_date,
        is_published: input.is_published,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, battle: data as BattleRow };
  },

  async updateBattle(id: string, input: BattleUpdateParsed): Promise<{ success: boolean; error?: string }> {
    const payload: Record<string, unknown> = { ...input };
    if (input.youtube_url !== undefined) {
      const parsed = parseYouTubeUrl(input.youtube_url);
      if (!parsed) return { success: false, error: "Enter a valid YouTube video link." };
      payload.youtube_url = parsed.normalizedUrl;
      payload.youtube_video_id = parsed.videoId;
    }

    const admin = createAdminClient();
    const { error } = await admin.from("battles").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async deleteBattle(id: string): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { error } = await admin.from("battles").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
