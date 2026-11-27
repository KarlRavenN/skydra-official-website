import { notFound } from "next/navigation";
import { PosterImage } from "@/components/ui/poster-image";
import Link from "next/link";
import { EventService } from "@/services/events";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { BattleCard } from "@/components/battles/battle-card";
import { EventCountdown } from "@/components/events/event-countdown";
import { EventRegistrationModal } from "@/components/events/event-registration-modal";
import { formatDate, formatDateTime, formatTime, formatCurrency } from "@/lib/utils/formatters";
import { Calendar, MapPin, ExternalLink, Clock, Users, ArrowLeft } from "lucide-react";

export const revalidate = 30;

interface EventDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const event = await EventService.getEventBySlug(params.slug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: `${event.title} | SKYDRA Rap Battle League`,
    description: event.description || `Event details, battles and digital registration for ${event.title}.`,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await EventService.getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const isPast = event.status === "past" || new Date(event.event_date) < new Date();
  const isFull = event.registrationCount >= event.capacity;
  const isRegistrationOpen = event.registration_status === "open" && !isPast && !isFull;

  return (
    <div className="py-8 md:py-12">
      <Container>
        {/* Back breadcrumb */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>

        {/* Top Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Poster Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <PosterImage
                src={event.poster_url}
                alt={event.title}
                placeholderText="SKYDRA POSTER"
                placeholderClassName="text-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>

          {/* Right Column: Event Details & Registration */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {event.status === "live" && <Badge variant="live">LIVE NOW</Badge>}
                {event.is_featured && <Badge variant="warning">FEATURED</Badge>}
                {isPast && <Badge variant="outline">ARCHIVED</Badge>}
                <Badge variant={isRegistrationOpen ? "success" : "default"}>
                  {isRegistrationOpen ? "REGISTRATION ACTIVE" : isFull && !isPast ? "EVENT FULL" : "REGISTRATION CLOSED"}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white font-heading leading-tight">
                {event.title}
              </h1>

              {event.description && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              )}

              {/* Schedule, Venue & Location Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-border bg-card/60 p-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Date & Time
                  </span>
                  <p className="text-sm font-bold text-white">{formatDate(event.event_date)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(event.event_date)}
                  </p>
                  {event.doors_open_time && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Doors open: {formatDateTime(event.doors_open_time)}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Venue
                  </span>
                  <p className="text-sm font-bold text-white">{event.venue_name}</p>
                  <p className="text-xs text-muted-foreground">{event.venue_address}</p>
                  {event.google_maps_url && (
                    <a
                      href={event.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-primary hover:underline gap-1 mt-1"
                    >
                      Open Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Admission
                  </span>
                  <p className="text-base font-black text-white">{formatCurrency(event.ticket_price)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Capacity
                  </span>
                  <p className="text-sm font-bold text-white">{event.capacity} Attendees Max</p>
                </div>
              </div>

              {/* Countdown for Upcoming */}
              {!isPast && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Countdown to Doors Open
                  </span>
                  <EventCountdown targetDate={event.event_date} />
                </div>
              )}
            </div>

            {/* Registration CTA Bar */}
            <div className="pt-4 border-t border-border">
              <EventRegistrationModal
                eventId={event.id}
                eventTitle={event.title}
                ticketPrice={Number(event.ticket_price)}
                gcashQrUrl={event.gcash_qr_url}
                gcashAccountName={event.gcash_account_name}
                gcashNumber={event.gcash_number}
                isOpen={false}
                disabled={!isRegistrationOpen}
                disabledReason={
                  isPast
                    ? "Event Concluded"
                    : isFull
                    ? "Event Full"
                    : event.registration_status === "paused"
                    ? "Registration Temporarily Paused"
                    : "Registration Closed"
                }
              />
            </div>
          </div>
        </div>

        {/* Battles from this event (YouTube videos) */}
        {event.battles.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-border">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Watch</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-heading">
                Battles from this event
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {event.battles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} hideEvent />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
