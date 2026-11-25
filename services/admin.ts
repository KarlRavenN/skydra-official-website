import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardMetrics, LeagueSettings } from "@/types/admin";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { BattleService } from "@/services/battles";
import { DEFAULT_PRIVACY_POLICY } from "@/lib/content/privacy-default";

export const AdminService = {
  /**
   * Aggregates live operational metrics for the Admin Dashboard.
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const [
      { count: totalEvents },
      { data: upcoming },
      { count: totalRegistrations },
      { count: checkedInAttendees },
      { data: recentRegs },
      publishedBattles,
    ] = await Promise.all([
      admin.from("events").select("id", { count: "exact", head: true }),
      admin.from("events").select("id, capacity").gte("event_date", now).in("status", ["published", "live"]),
      admin.from("registrations").select("id", { count: "exact", head: true }).neq("status", "cancelled"),
      admin.from("registrations").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
      admin
        .from("registrations")
        .select(`
          id,
          full_name,
          ticket_code,
          created_at,
          event:events(title)
        `)
        .order("created_at", { ascending: false })
        .limit(5),
      BattleService.countPublished(),
    ]);

    const upcomingEvents = (upcoming as Array<{ id: string; capacity: number }>) || [];
    const upcomingCapacity = upcomingEvents.reduce((sum, e) => sum + e.capacity, 0);

    let upcomingRegistered = 0;
    if (upcomingEvents.length > 0) {
      const { count } = await admin
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .in("event_id", upcomingEvents.map((e) => e.id))
        .neq("status", "cancelled");
      upcomingRegistered = count || 0;
    }

    return {
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents.length,
      totalRegistrations: totalRegistrations || 0,
      checkedInAttendees: checkedInAttendees || 0,
      upcomingCapacity,
      upcomingRegistered,
      publishedBattles,
      recentRegistrations: ((recentRegs as any[]) || []).map((r) => ({
        id: r.id,
        fullName: r.full_name,
        ticketCode: r.ticket_code,
        createdAt: r.created_at,
        eventTitle: (r.event as unknown as { title: string })?.title || "Unknown Event",
      })),
    };
  },

  /**
   * Retrieves league settings (public read). Used by the public footer,
   * /house-rules and /privacy as well as the admin settings page.
   */
  async getLeagueSettings(): Promise<Partial<LeagueSettings>> {
    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase.from("league_settings").select("key, value");
      if (error || !data) return {};

      const settingsMap: Record<string, any> = {};
      for (const item of data as any[]) settingsMap[item.key] = item.value;

      return {
        leagueName: settingsMap.league_info?.name || "SKYDRA Rap Battle League",
        leagueTagline: settingsMap.league_info?.tagline || "The Premier Underground Rap Battle Arena",
        contactEmail: settingsMap.league_info?.contactEmail || "skydrabattles@gmail.com",
        socials: settingsMap.social_links || {},
        houseRules: Array.isArray(settingsMap.house_rules?.rules) ? settingsMap.house_rules.rules.join("\n") : "",
        privacyPolicy:
          typeof settingsMap.privacy_policy?.text === "string" && settingsMap.privacy_policy.text.trim()
            ? settingsMap.privacy_policy.text
            : DEFAULT_PRIVACY_POLICY,
      };
    } catch (err) {
      console.error("Error reading league settings:", err);
      return {};
    }
  },

  /**
   * Admin: Updates a specific league configuration key.
   */
  async updateSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    const { error } = await admin.from("league_settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    } as any);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
