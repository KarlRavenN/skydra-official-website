import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Event | Admin",
};

export default function CreateEventPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/events"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Event List
      </Link>

      <EventForm />
    </div>
  );
}
