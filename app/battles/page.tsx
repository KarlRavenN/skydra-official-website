import Link from "next/link";
import { BattleService } from "@/services/battles";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PosterImage } from "@/components/ui/poster-image";
import { BattleCard } from "@/components/battles/battle-card";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Swords } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Battles",
  description:
    "Watch SKYDRA Rap Battle League battles. Tournament and non-tournament rap battle videos, organized by event.",
};

interface BattlesPageProps {
  searchParams: { event?: string; page?: string };
}

function buildHref(event: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (event) params.set("event", event);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/battles?${qs}` : "/battles";
}

export default async function BattlesPage({ searchParams }: BattlesPageProps) {
  const eventSlug = searchParams.event?.trim() || undefined;
  const requestedPage = Number.parseInt(searchParams.page || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [result, events] = await Promise.all([
    BattleService.getPublishedBattles({ eventSlug, page }),
    BattleService.getEventsWithBattles(),
  ]);

  // The featured battle is the newest one for the current filter (first item of page 1).
  const featured = result.page === 1 ? result.battles[0] : undefined;
  const rest = featured ? result.battles.slice(1) : result.battles;
  const activeEvent = events.find((e) => e.slug === eventSlug);

  return (
    <div className="py-10">
      <Container>
        <div className="mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Watch</span>
          <h1 className="text-4xl font-black uppercase tracking-wider text-white font-heading">BATTLES</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Watch SKYDRA battles on YouTube. Pick an event to see only its battles.
          </p>
        </div>

        {/* Mobile: horizontally scrollable event chips */}
        <div className="lg:hidden -mx-4 mb-6 overflow-x-auto px-4">
          <div className="flex gap-2 pb-2">
            <Link
              href="/battles"
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                !eventSlug ? "border-primary bg-primary text-white" : "border-border text-muted-foreground"
              )}
            >
              All battles
            </Link>
            {events.map((e) => (
              <Link
                key={e.id}
                href={buildHref(e.slug, 1)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                  eventSlug === e.slug ? "border-primary bg-primary text-white" : "border-border text-muted-foreground"
                )}
              >
                {e.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* LEFT (about 60%): videos */}
          <div className="space-y-6 lg:col-span-3">
            {result.battles.length === 0 ? (
              <EmptyState
                title="No battles yet"
                description={
                  eventSlug
                    ? "There are no published battles for this event yet."
                    : "Battle videos will show up here as soon as they are published."
                }
                icon={<Swords className="w-6 h-6" />}
                actionHref={eventSlug ? "/battles" : undefined}
                actionLabel={eventSlug ? "See all battles" : undefined}
              />
            ) : (
              <>
                {activeEvent && (
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Showing battles from <span className="text-white">{activeEvent.title}</span>
                  </p>
                )}
                {featured && <BattleCard battle={featured} featured />}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {rest.map((battle) => (
                      <BattleCard key={battle.id} battle={battle} />
                    ))}
                  </div>
                )}

                {result.totalPages > 1 && (
                  <nav className="flex items-center justify-between border-t border-border pt-4" aria-label="Pagination">
                    {result.page > 1 ? (
                      <Link
                        href={buildHref(eventSlug, result.page - 1)}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        &larr; Previous
                      </Link>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted-foreground">
                      Page {result.page} of {result.totalPages}
                    </span>
                    {result.page < result.totalPages ? (
                      <Link
                        href={buildHref(eventSlug, result.page + 1)}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Next &rarr;
                      </Link>
                    ) : (
                      <span />
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          {/* RIGHT (about 40%): Battle Events list (desktop) */}
          <aside className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-24 space-y-3 rounded-lg border border-border bg-card/60 p-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Battle Events</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/battles"
                    className={cn(
                      "block rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                      !eventSlug
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-white"
                    )}
                  >
                    All battles
                  </Link>
                </li>
                {events.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={buildHref(e.slug, 1)}
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-2 transition-colors",
                        eventSlug === e.slug ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-secondary">
                        <PosterImage
                          src={e.poster_url}
                          alt={e.title}
                          placeholderText="SKY"
                          placeholderClassName="text-[10px]"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold uppercase tracking-wider text-white">
                          {e.title}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {formatDate(e.event_date)} &middot; {e.battleCount} battle{e.battleCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
                {events.length === 0 && (
                  <li className="px-1 py-2 text-xs text-muted-foreground">No events with battles yet.</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
