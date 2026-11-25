import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EventRow, EventWithBattles, EventFormInput } from "@/types/events";
import { RegistrationStatus } from "@/types/database";
import { BattleService } from "@/services/battles";
import { deletePosterByUrl } from "@/lib/utils/poster-storage";

function friendlyEventError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That URL slug is already used by another event.";
  if (error.code === "23503") return "This event still has registrations, so it cannot be deleted. Archive it instead.";
  return error.message;
}

/**
 * Service handling all Event catalog, fetching, and administrative lifecycle operations.
 */
export const EventService = {
  /**
   * Fetches published upcoming events ordered by date ascending.
   */
  async getUpcomingEvents(): Promise<EventRow[]> {
    const supabase = await createServerSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .in("status", ["published", "live"])
      .gte("event_date", now)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
    return (data as any) || [];
  },

  /**
   * Fetches past/archived events ordered by date descending.
   * Archived = status "past" (set by the admin "Archive" action).
   */
  async getPastEvents(): Promise<EventRow[]> {
    const supabase = await createServerSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`status.eq.past,event_date.lt.${now}`)
      .in("status", ["published", "live", "past"])
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Error fetching past events:", error);
      return [];
    }
    return (data as any) || [];
  },

  /**
   * Retrieves the current featured event, or the nearest upcoming event.
   */
  async getFeaturedEvent(): Promise<EventRow | null> {
    const supabase = await createServerSupabase();
    const now = new Date().toISOString();

    const { data: featured } = await supabase
      .from("events")
      .select("*")
      .eq("is_featured", true)
      .in("status", ["published", "live"])
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (featured) return featured as any;

    const { data: nextUpcoming } = await supabase
      .from("events")
      .select("*")
      .in("status", ["published", "live"])
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    return (nextUpcoming as any) || null;
  },

  /**
   * Number of non-cancelled registrations for an event.
   * Uses the service role because the public key can no longer read registrations.
   */
  async getRegistrationCount(eventId: string): Promise<number> {
    const admin = createAdminClient();
    const { count } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("status", "cancelled");
    return count || 0;
  },

  /**
   * Retrieves an event by its slug together with its published battles (YouTube videos).
   */
  async getEventBySlug(slug: string): Promise<EventWithBattles | null> {
    const supabase = await createServerSupabase();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (eventError || !event) return null;

    const eventRow = event as EventRow;
    const [battles, registrationCount] = await Promise.all([
      BattleService.getPublishedBattlesForEvent(eventRow.id),
      EventService.getRegistrationCount(eventRow.id),
    ]);

    return { ...eventRow, battles, registrationCount };
  },

  /**
   * Admin: Retrieves all events regardless of status.
   */
  async getAllEventsAdmin(): Promise<EventRow[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Error fetching admin events:", error);
      return [];
    }
    return (data as any) || [];
  },

  /**
   * Admin: Creates a new event. `payload` is already validated/normalized by eventFormSchema.
   */
  async createEvent(payload: EventFormInput): Promise<{ success: boolean; event?: EventRow; error?: string }> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("events")
      .insert({ ...payload, ticket_price: payload.ticket_price || 0 })
      .select()
      .single();

    if (error) return { success: false, error: friendlyEventError(error) };
    return { success: true, event: data as any };
  },

  /**
   * Admin: Updates event metadata. If the poster changed, the old file is
   * removed from Storage (best effort).
   */
  async updateEvent(id: string, payload: Partial<EventFormInput>): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();

    let oldPosterUrl: string | null | undefined;
    if (payload.poster_url !== undefined) {
      const { data: current } = await admin.from("events").select("poster_url").eq("id", id).maybeSingle();
      oldPosterUrl = current?.poster_url;
    }

    const { error } = await admin.from("events").update(payload).eq("id", id);
    if (error) return { success: false, error: friendlyEventError(error) };

    if (oldPosterUrl && oldPosterUrl !== payload.poster_url) {
      await deletePosterByUrl(oldPosterUrl);
    }
    return { success: true };
  },

  /**
   * Admin: Quickly toggles registration status ('open', 'closed', 'paused').
   */
  async setRegistrationStatus(id: string, status: RegistrationStatus): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { error } = await admin.from("events").update({ registration_status: status }).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Admin: Archives an event (status "past"), closing registration. It then
   * appears under Past Events with its poster.
   */
  async archiveEvent(id: string): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("events")
      .update({ status: "past", registration_status: "closed" })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /**
   * Admin: Deletes an event (guarded: the foreign key blocks deletion when registrations exist).
   */
  async deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { data: current } = await admin.from("events").select("poster_url").eq("id", id).maybeSingle();

    const { error } = await admin.from("events").delete().eq("id", id);
    if (error) return { success: false, error: friendlyEventError(error) };

    await deletePosterByUrl(current?.poster_url);
    return { success: true };
  },
};
