import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BattleService } from "@/services/battles";
import { Button } from "@/components/ui/button";
import { EditEventForm } from "@/components/admin/edit-event-form";
import { EventRow } from "@/types/events";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface EditEventPageProps {
  searchParams: {
    id?: string;
  };
}

export default async function EditEventPage({ searchParams }: EditEventPageProps) {
  if (!searchParams.id) {
    notFound();
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select("*")
    .eq("id", searchParams.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const event = data as EventRow;
  const battleCount = (
    await BattleService.listBattlesAdmin({ eventId: event.id })
  ).length;

  return (
    <div className="max-w-4xl space-y-8">
      <Link
        href="/admin/events"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Event Management
      </Link>

      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
          EDIT: {event.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Update event details, poster, admission and capacity.
        </p>
      </div>

      {/* Event Details Editor */}
      <EditEventForm event={event} />

      {/* Battles linked to this event are managed on the Battles admin page */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          {battleCount} battle{battleCount === 1 ? "" : "s"} linked to this event.
        </p>
        <Link href={`/admin/battles?event=${event.id}`}>
          <Button size="sm" variant="secondary">
            Manage battles for this event
          </Button>
        </Link>
      </div>
    </div>
  );
}
