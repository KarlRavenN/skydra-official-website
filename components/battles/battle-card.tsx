import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { BATTLE_TYPE_LABELS, BattleWithEvent } from "@/types/battles";
import { getYouTubeThumbnailUrl } from "@/lib/utils/youtube";

export interface BattleCardProps {
  battle: BattleWithEvent;
  /** Large version used for the featured battle on /battles. */
  featured?: boolean;
  /** Hide the event badge (e.g. on the event page where the event is obvious). */
  hideEvent?: boolean;
}

/**
 * One battle video. The whole card is a link that opens the YouTube video in a new tab.
 */
export function BattleCard({ battle, featured = false, hideEvent = false }: BattleCardProps) {
  return (
    <a
      href={battle.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        <Image
          src={getYouTubeThumbnailUrl(battle.youtube_video_id)}
          alt={battle.title}
          fill
          priority={featured}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 30vw"}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-primary text-white shadow-lg",
              featured ? "h-16 w-16" : "h-11 w-11"
            )}
          >
            <Play className={cn("fill-current", featured ? "h-7 w-7" : "h-5 w-5")} />
          </span>
        </div>
      </div>

      <div className={cn("space-y-3", featured ? "p-5" : "p-4")}>
        <h3
          className={cn(
            "font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors",
            featured ? "text-xl sm:text-2xl" : "text-sm line-clamp-2"
          )}
        >
          {battle.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant={battle.battle_type === "tournament" ? "warning" : "default"}>
            {BATTLE_TYPE_LABELS[battle.battle_type]}
          </Badge>
          {!hideEvent && battle.event && <Badge variant="outline">{battle.event.title}</Badge>}
        </div>
      </div>
    </a>
  );
}
