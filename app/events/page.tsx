import { EventService } from "@/services/events";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { EventCard } from "@/components/events/event-card";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const revalidate = 60;

interface EventsPageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function EventsCatalogPage({ searchParams }: EventsPageProps) {
  const activeTab = searchParams.tab === "past" ? "past" : "upcoming";

  const [upcomingEvents, pastEvents] = await Promise.all([
    EventService.getUpcomingEvents(),
    EventService.getPastEvents(),
  ]);

  const displayedEvents = activeTab === "past" ? pastEvents : upcomingEvents;

  return (
    <div className="py-10">
      <Container>
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Schedule & History</span>
          <h1 className="text-4xl font-black uppercase tracking-wider text-white font-heading">
            SKYDRA EVENT SCHEDULE
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Browse all upcoming battle showdowns, lock in digital tickets, or explore the archive of past events.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border mb-8">
          <Link
            href="/events?tab=upcoming"
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "upcoming"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            )}
          >
            Upcoming Events ({upcomingEvents.length})
          </Link>
          <Link
            href="/events?tab=past"
            className={cn(
              "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "past"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            )}
          >
            Past Events ({pastEvents.length})
          </Link>
        </div>

        {/* Event Cards Grid */}
        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-2">
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              {activeTab === "upcoming" ? "No Upcoming Events Announced" : "No Past Events In Archive"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === "upcoming"
                ? "Check back soon as new fight dates and locations are announced."
                : "Event history is currently empty."}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
