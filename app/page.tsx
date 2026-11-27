import Link from "next/link";
import { PosterImage } from "@/components/ui/poster-image";
import { EventService } from "@/services/events";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { EventCard } from "@/components/events/event-card";
import { EventCountdown } from "@/components/events/event-countdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils/formatters";
import { Calendar, MapPin, Swords, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const [featuredEvent, upcomingEvents, pastEvents] = await Promise.all([
    EventService.getFeaturedEvent(),
    EventService.getUpcomingEvents(),
    EventService.getPastEvents(),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION / FEATURED EVENT */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-zinc-950 via-zinc-900 to-background py-14 sm:py-20 lg:py-24">
        <Container>
          {featuredEvent ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Event Intel */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="danger">OFFICIAL BATTLE CARD</Badge>
                  {featuredEvent.status === "live" ? (
                    <Badge variant="live">HAPPENING NOW</Badge>
                  ) : (
                    <Badge variant="warning">FEATURED EVENT</Badge>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider text-white font-heading leading-tight">
                  {featuredEvent.title}
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                  {featuredEvent.description ||
                    "Underground rap battle showdown. Witness the fiercest emcees clash bar-for-bar in the official SKYDRA arena."}
                </p>

                {/* Event Schedule & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-border bg-card/60 p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Date & Time
                    </span>
                    <p className="text-sm font-bold text-white">{formatDateTime(featuredEvent.event_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Venue
                    </span>
                    <p className="text-sm font-bold text-white truncate">{featuredEvent.venue_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{featuredEvent.venue_address}</p>
                  </div>
                </div>

                {/* Countdown */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Doors Open In
                  </span>
                  <EventCountdown targetDate={featuredEvent.event_date} />
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href={`/events/${featuredEvent.slug}`}>
                    <Button size="lg" variant="primary" className="gap-2">
                      Get Tickets <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button size="lg" variant="outline">
                      All Events
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Event Poster Showcase */}
              <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[380px] sm:max-w-[420px] md:max-w-[440px] lg:max-w-[460px] xl:max-w-[480px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-4 rounded-3xl bg-primary/15 blur-2xl opacity-70"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-card shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
                    <PosterImage
                      src={featuredEvent.poster_url}
                      alt={featuredEvent.title}
                      placeholderText="SKYDRA ARENA"
                      fill={false}
                      quality={100}
                      priority
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 440px, 480px"
                    />
                    <div className="border-t border-white/10 bg-zinc-950/95 px-4 py-3.5 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Admission
                      </span>
                      <span className="text-sm sm:text-base font-black tracking-wide text-white">
                        {formatCurrency(featuredEvent.ticket_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white font-heading">
                SKY<span className="text-primary">DRA</span> RAP BATTLE LEAGUE
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                The premier underground rap battle platform in the Philippines. Raw lyricism, heavy punchlines, and certified match-ups.
              </p>
              <div className="pt-4">
                <Link href="/events">
                  <Button size="lg" variant="primary">Browse Event Schedule</Button>
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 2. UPCOMING EVENTS SHOWCASE */}
      <Section spacing="md">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-border gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Scheduled Showdowns</span>
              <h2 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
                Upcoming Events
              </h2>
            </div>
            <Link href="/events">
              <Button variant="outline" size="sm" className="gap-1.5">
                View Full Calendar <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider text-white">No upcoming events posted right now</p>
              <p className="text-xs text-muted-foreground">The league matchmakers are organizing the next battle card. Check back soon.</p>
            </div>
          )}
        </Container>
      </Section>

      {/* 3. ABOUT THE LEAGUE TEASER */}
      <Section spacing="md" className="border-y border-border bg-card/40">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-primary">The Arena</span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white font-heading leading-tight">
                BUILT FOR THE PHILIPPINE UNDERGROUND
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SKYDRA was founded to preserve the raw integrity of competitive battle rap. No staged antics, no pre-written agreements. Two emcees enter the pit with three rounds to out-write, out-perform, and out-rap each other.
              </p>
              <div className="pt-2">
                <Link href="/about">
                  <Button variant="secondary" size="md">
                    Learn League History
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-6 space-y-2">
                <Swords className="h-8 w-8 text-primary" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Pure Lyricism</h3>
                <p className="text-xs text-muted-foreground">
                  Strictly judged on rhyme scheme, delivery, punchlines, rebuttal ability, and stage presence.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 space-y-2">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Zero Violence Policy</h3>
                <p className="text-xs text-muted-foreground">
                  Intense verbal warfare stays strictly on the mic. Physical altercations result in immediate league disqualification.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. PAST EVENTS ARCHIVE PREVIEW */}
      {pastEvents.length > 0 && (
        <Section spacing="md">
          <Container>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hall of Battles</span>
                <h2 className="text-3xl font-black uppercase tracking-wider text-white font-heading">
                  Previous Events
                </h2>
              </div>
              <Link href="/events?tab=past">
                <Button variant="outline" size="sm">
                  Full Archive
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
