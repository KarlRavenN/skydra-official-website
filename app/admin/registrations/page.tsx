import Link from "next/link";
import { RegistrationService } from "@/services/registrations";
import { EventService } from "@/services/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegistrationRowActions } from "@/components/admin/registration-row-actions";
import { formatDateTime } from "@/lib/utils/formatters";
import { isUuid } from "@/lib/utils/api";
import { AttendeeStatus } from "@/types/database";
import { FileSpreadsheet } from "lucide-react";

export const revalidate = 0;

interface RegistrationsPageProps {
  searchParams: {
    eventId?: string;
    search?: string;
    status?: string;
  };
}

const STATUSES: AttendeeStatus[] = ["pending", "confirmed", "checked_in", "cancelled"];

const fieldClass =
  "w-full rounded-md border border-border bg-input px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default async function AdminRegistrationsPage({ searchParams }: RegistrationsPageProps) {
  const eventId = searchParams.eventId && isUuid(searchParams.eventId) ? searchParams.eventId : undefined;
  const status = STATUSES.includes(searchParams.status as AttendeeStatus)
    ? (searchParams.status as AttendeeStatus)
    : undefined;
  const search = searchParams.search?.trim() || undefined;

  const [registrations, events] = await Promise.all([
    RegistrationService.getRegistrationsAdmin({ eventId, search, status }),
    EventService.getAllEventsAdmin(),
  ]);

  // CSV export keeps the active filters.
  const exportParams = new URLSearchParams();
  if (eventId) exportParams.set("eventId", eventId);
  if (status) exportParams.set("status", status);
  if (search) exportParams.set("search", search);
  const exportQuery = exportParams.toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
            REGISTRATIONS & DIGITAL PASSES
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time attendee check-ins, guest roster, and CSV export. {registrations.length} result
            {registrations.length === 1 ? "" : "s"}.
          </p>
        </div>

        <a href={`/api/admin/registrations/export${exportQuery ? `?${exportQuery}` : ""}`} download="skydra-registrations.csv">
          <Button variant="secondary" size="md" className="gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </Button>
        </a>
      </div>

      <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-card p-4">
        <input
          type="text"
          name="search"
          defaultValue={searchParams.search || ""}
          placeholder="Search name, contact number, ticket code, or barangay..."
          className={`${fieldClass} sm:col-span-2`}
        />
        <select name="eventId" defaultValue={eventId || ""} className={fieldClass}>
          <option value="">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <select name="status" defaultValue={status || ""} className={fieldClass}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary" size="sm">
            Filter
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Attendee</th>
              <th className="p-4">Event</th>
              <th className="p-4">Ticket Code</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Address</th>
              <th className="p-4">Emergency Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.length > 0 ? (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-secondary/20 transition-colors align-top">
                  <td className="p-4 space-y-0.5">
                    <span className="font-bold text-white block">{reg.full_name}</span>
                    <span className="text-[11px] text-muted-foreground block">Age {reg.age}</span>
                    <span className="text-[11px] text-muted-foreground block break-all">{reg.facebook_profile}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{reg.event_title}</td>
                  <td className="p-4">
                    <Link
                      href={`/tickets/${reg.ticket_code}`}
                      target="_blank"
                      className="font-mono text-primary font-bold hover:underline break-all"
                    >
                      {reg.ticket_code}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{reg.phone_number}</td>
                  <td className="p-4 text-muted-foreground">
                    {reg.barangay}, {reg.city}
                  </td>
                  <td className="p-4 text-muted-foreground space-y-0.5">
                    <span className="block">{reg.emergency_contact_name}</span>
                    <span className="block text-[11px]">{reg.emergency_contact_number}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={reg.status === "checked_in" ? "success" : reg.status === "cancelled" ? "danger" : "default"}>
                      {reg.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDateTime(reg.created_at)}</td>
                  <td className="p-4">
                    <RegistrationRowActions
                      registrationId={reg.id}
                      ticketCode={reg.ticket_code}
                      isCheckedIn={reg.status === "checked_in"}
                      attendeeName={reg.full_name}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  No registrations found matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
