import React from "react";
import Link from "next/link";
import { PosterImage } from "@/components/ui/poster-image";
import { EventRow } from "@/types/events";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

export interface EventCardProps {
  event: EventRow;
}

export function EventCard({ event }: EventCardProps) {
  const isPast = event.status === "past" || new Date(event.event_date) < new Date();
  const isRegistrationOpen = event.registration_status === "open" && !isPast;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
      {/* Poster Media Frame */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        <PosterImage
          src={event.poster_url}
          alt={event.title}
          placeholderText="SKYDRA EVENT"
          className="transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {event.status === "live" && <Badge variant="live">LIVE NOW</Badge>}
          {event.is_featured && <Badge variant="warning">FEATURED</Badge>}
          {isPast && <Badge variant="outline">ARCHIVED</Badge>}
        </div>

        {/* Admission Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded bg-black/80 px-2.5 py-1 text-xs font-black tracking-wider text-white border border-white/10 backdrop-blur-sm">
            {formatCurrency(event.ticket_price)}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="line-clamp-1">{event.venue_name} • {event.venue_address}</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isPast ? (
              <span className="text-muted-foreground">Completed</span>
            ) : isRegistrationOpen ? (
              <span className="text-emerald-400">Registration Open</span>
            ) : (
              <span className="text-amber-500">Registration Closed</span>
            )}
          </span>

          <Link href={`/events/${event.slug}`}>
            <Button size="sm" variant={isRegistrationOpen ? "primary" : "secondary"}>
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
