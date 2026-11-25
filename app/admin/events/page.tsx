import Link from "next/link";
import { EventService } from "@/services/events";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventRowActions } from "@/components/admin/event-row-actions";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { Plus, Calendar, MapPin, Edit3 } from "lucide-react";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const events = await EventService.getAllEventsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
            EVENT MANAGEMENT
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, publish, edit, archive events, or toggle ticket registrations.
          </p>
        </div>
        <Link href="/admin/events/create">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Event Details</th>
              <th className="p-4">Date & Schedule</th>
              <th className="p-4">Admission</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-bold text-white text-sm block">{event.title}</span>
                      <span className="text-muted-foreground text-[11px] block">{event.venue_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="space-y-0.5">
                      <span className="text-white block font-medium">{formatDate(event.event_date)}</span>
                      <span className="text-[10px] text-muted-foreground">Slug: /{event.slug}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {formatCurrency(event.ticket_price)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {event.capacity} max
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        event.status === "live"
                          ? "live"
                          : event.status === "published"
                          ? "success"
                          : "outline"
                      }
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={event.registration_status === "open" ? "success" : "danger"}>
                      {event.registration_status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/admin/events/edit?id=${event.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Button>
                      </Link>
                      <EventRowActions
                        eventId={event.id}
                        currentRegistrationStatus={event.registration_status}
                        isArchived={event.status === "past"}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No events found. Click &quot;Create New Event&quot; above to create your first rap battle event.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
