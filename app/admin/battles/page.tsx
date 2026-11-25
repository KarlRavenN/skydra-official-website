import Link from "next/link";
import { BattleService } from "@/services/battles";
import { EventService } from "@/services/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BattleRowActions } from "@/components/admin/battle-row-actions";
import { BATTLE_TYPE_LABELS } from "@/types/battles";
import { formatDate } from "@/lib/utils/formatters";
import { Plus } from "lucide-react";

export const revalidate = 0;

interface AdminBattlesPageProps {
  searchParams: { search?: string; event?: string; type?: string };
}

const fieldClass =
  "w-full rounded-md border border-border bg-input px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default async function AdminBattlesPage({ searchParams }: AdminBattlesPageProps) {
  const [battles, events] = await Promise.all([
    BattleService.listBattlesAdmin({
      search: searchParams.search,
      eventId: searchParams.event,
      type: searchParams.type,
    }),
    EventService.getAllEventsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
            BATTLE MANAGEMENT
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Add YouTube battles, link them to events, and publish or hide them on the Battles page.
          </p>
        </div>
        <Link href="/admin/battles/create">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" /> Add Battle
          </Button>
        </Link>
      </div>

      <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-card p-4">
        <input
          type="text"
          name="search"
          defaultValue={searchParams.search || ""}
          placeholder="Search by title..."
          className={fieldClass}
        />
        <select name="event" defaultValue={searchParams.event || ""} className={fieldClass}>
          <option value="">All Events</option>
          <option value="none">No event</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={searchParams.type || ""} className={fieldClass}>
          <option value="">All Types</option>
          <option value="non_tournament">Non-Tournament</option>
          <option value="tournament">Tournament</option>
        </select>
        <Button type="submit" variant="primary" size="sm">
          Filter
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Event</th>
              <th className="p-4">Type</th>
              <th className="p-4">Battle Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {battles.length > 0 ? (
              battles.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <a
                      href={b.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white text-sm hover:text-primary"
                    >
                      {b.title}
                    </a>
                  </td>
                  <td className="p-4 text-muted-foreground">{b.event?.title || "No event"}</td>
                  <td className="p-4">
                    <Badge variant={b.battle_type === "tournament" ? "warning" : "default"}>
                      {BATTLE_TYPE_LABELS[b.battle_type]}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{b.battle_date ? formatDate(b.battle_date) : "-"}</td>
                  <td className="p-4">
                    <Badge variant={b.is_published ? "success" : "outline"}>
                      {b.is_published ? "Published" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <BattleRowActions battleId={b.id} isPublished={b.is_published} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No battles found. Click &quot;Add Battle&quot; to add your first YouTube battle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
