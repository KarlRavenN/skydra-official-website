"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BattleRow } from "@/types/battles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { parseYouTubeUrl } from "@/lib/utils/youtube";
import { AlertCircle, CheckCircle } from "lucide-react";

interface EventOption {
  id: string;
  title: string;
}

interface BattleFormProps {
  events: EventOption[];
  /** Omit to create a new battle. */
  battle?: BattleRow;
}

export function BattleForm({ events, battle }: BattleFormProps) {
  const router = useRouter();
  const isEdit = !!battle;

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [urlTouched, setUrlTouched] = useState(false);

  const [formData, setFormData] = useState({
    title: battle?.title ?? "",
    youtube_url: battle?.youtube_url ?? "",
    event_id: battle?.event_id ?? "",
    battle_type: battle?.battle_type ?? "non_tournament",
    battle_date: battle?.battle_date ?? "",
    is_published: battle?.is_published ?? true,
  });

  const parsed = useMemo(() => parseYouTubeUrl(formData.youtube_url), [formData.youtube_url]);
  const urlError =
    urlTouched && formData.youtube_url.trim() && !parsed ? "Enter a valid YouTube video link" : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setUrlTouched(true);

    if (!parsed) {
      setFeedback({ type: "error", text: "Enter a valid YouTube video link." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/battles/${battle!.id}` : "/api/admin/battles", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          event_id: formData.event_id || null,
          battle_date: formData.battle_date || null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Failed to save battle" });
        return;
      }

      if (isEdit) {
        setFeedback({ type: "success", text: "Battle updated successfully." });
        router.refresh();
      } else {
        router.push("/admin/battles");
        router.refresh();
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-black font-heading">{isEdit ? "EDIT BATTLE" : "ADD NEW BATTLE"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {feedback && (
            <div
              className={`rounded-md p-3 text-xs flex items-center space-x-2 border ${
                feedback.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                  : "bg-rose-950/40 border-rose-800 text-rose-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <Input
            id="title"
            label="Title"
            required
            placeholder="Plaridhel vs Empithri"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="space-y-3">
            <Input
              id="youtube_url"
              label="YouTube URL"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtube_url}
              error={urlError}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              onBlur={() => setUrlTouched(true)}
            />
            {parsed && (
              <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md border border-border bg-secondary">
                <Image src={parsed.thumbnailUrl} alt="Video thumbnail preview" fill className="object-cover" sizes="384px" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="event_id" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event
              </label>
              <select
                id="event_id"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                className="w-full h-10 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">No event</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="battle_date"
              label="Battle Date (optional)"
              type="date"
              value={formData.battle_date}
              onChange={(e) => setFormData({ ...formData, battle_date: e.target.value })}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Battle Type
            </legend>
            <div className="flex flex-wrap gap-6">
              {[
                { value: "non_tournament", label: "Non-Tournament" },
                { value: "tournament", label: "Tournament" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="radio"
                    name="battle_type"
                    value={opt.value}
                    checked={formData.battle_type === opt.value}
                    onChange={() => setFormData({ ...formData, battle_type: opt.value as any })}
                    className="h-4 w-4 border-border bg-input text-primary focus:ring-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
            />
            <label htmlFor="is_published" className="text-xs font-bold uppercase tracking-wider text-white">
              Published (visible on the Battles page)
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Link href="/admin/battles">
              <Button type="button" variant="outline">
                {isEdit ? "Back" : "Cancel"}
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={loading}>
              {isEdit ? "Save Battle" : "Add Battle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
