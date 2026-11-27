"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EventRow } from "@/types/events";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PosterUploader } from "@/components/admin/poster-uploader";
import { slugify, toManilaDateTimeLocal } from "@/lib/utils/formatters";
import { AlertCircle, CheckCircle } from "lucide-react";

interface EventFormProps {
  /** Omit to create a new event. */
  event?: EventRow;
}

const selectClass =
  "w-full h-10 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/**
 * One form for both creating and editing events.
 * Date/time inputs are always Asia/Manila wall time (what you type is what the public sees).
 */
export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    description: event?.description ?? "",
    poster_url: event?.poster_url ?? "",
    event_date: toManilaDateTimeLocal(event?.event_date),
    doors_open_time: toManilaDateTimeLocal(event?.doors_open_time),
    venue_name: event?.venue_name ?? "",
    venue_address: event?.venue_address ?? "",
    google_maps_url: event?.google_maps_url ?? "",
    ticket_price: event?.ticket_price ?? 0,
    gcash_qr_url: event?.gcash_qr_url ?? "",
    gcash_account_name: event?.gcash_account_name ?? "",
    gcash_number: event?.gcash_number ?? "",
    capacity: event?.capacity ?? 200,
    status: event?.status ?? "published",
    registration_status: event?.registration_status ?? "open",
    is_featured: event?.is_featured ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(isEdit ? `/api/admin/events/${event!.id}` : "/api/admin/events", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Failed to save event" });
        return;
      }

      if (isEdit) {
        setFeedback({ type: "success", text: "Event updated successfully." });
        router.refresh();
      } else {
        router.push("/admin/events");
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
        <CardTitle className="text-xl font-black font-heading">
          {isEdit ? "EVENT DETAILS" : "CREATE NEW BATTLE EVENT"}
        </CardTitle>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="title"
              label="Event Title"
              required
              placeholder="e.g. SKYDRA 04: BLOODLINE"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData((prev) => ({ ...prev, title, slug: isEdit ? prev.slug : slugify(title) }));
              }}
            />

            <Input
              id="slug"
              label={isEdit ? "URL Slug" : "URL Slug (Auto-generated)"}
              required
              placeholder="skydra-04-bloodline"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Event details, venue policies, featured battlers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <PosterUploader
            value={formData.poster_url}
            onChange={(url) => setFormData((prev) => ({ ...prev, poster_url: url }))}
            onUploadingChange={setUploading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="event_date"
              label="Event Date & Time (Manila time)"
              type="datetime-local"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            />

            <Input
              id="doors_open_time"
              label="Doors Open Time (Manila time)"
              type="datetime-local"
              value={formData.doors_open_time}
              onChange={(e) => setFormData({ ...formData, doors_open_time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="venue_name"
              label="Venue Name"
              required
              placeholder="e.g. 19 East Bar & Grill"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
            />

            <Input
              id="venue_address"
              label="Venue Address"
              required
              placeholder="Km 19 East Service Rd, Sucat, Muntinlupa"
              value={formData.venue_address}
              onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
            />
          </div>

          <Input
            id="google_maps_url"
            label="Google Maps URL"
            placeholder="https://maps.google.com/..."
            value={formData.google_maps_url}
            onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="ticket_price"
              label="Admission Price (PHP - 0 for Free)"
              type="number"
              min="0"
              step="50"
              required
              value={formData.ticket_price}
              onChange={(e) => setFormData({ ...formData, ticket_price: Number(e.target.value) })}
            />

            <Input
              id="capacity"
              label="Venue Max Capacity"
              type="number"
              min="1"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  GCash Payment Configuration
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Shown to attendees when Ticket Price is greater than ₱0.
                </p>
              </div>
              {Number(formData.ticket_price) > 0 && (
                <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary border border-primary/30">
                  Paid Event Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="gcash_account_name"
                label="GCash Account Name"
                placeholder="e.g. Juan Dela Cruz"
                value={formData.gcash_account_name}
                onChange={(e) => setFormData({ ...formData, gcash_account_name: e.target.value })}
              />

              <Input
                id="gcash_number"
                label="GCash Number"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="09171234567"
                value={formData.gcash_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gcash_number: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
              />
            </div>

            <PosterUploader
              folder="gcash-qr"
              label="GCash QR Image"
              aspectClassName="aspect-square w-40"
              placeholderText="NO QR"
              value={formData.gcash_qr_url}
              onChange={(url) => setFormData((prev) => ({ ...prev, gcash_qr_url: url }))}
              onUploadingChange={setUploading}
            />
          </div>

          {isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lifecycle Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className={selectClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="live">Live (Happening Now)</option>
                  <option value="past">Past (Archived)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="registration_status" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Registration
                </label>
                <select
                  id="registration_status"
                  value={formData.registration_status}
                  onChange={(e) => setFormData({ ...formData, registration_status: e.target.value as any })}
                  className={selectClass}
                >
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
            />
            <label htmlFor="is_featured" className="text-xs font-bold uppercase tracking-wider text-white">
              Feature on Homepage Hero
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            {!isEdit && (
              <Link href="/admin/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            )}
            <Button type="submit" variant="primary" size={isEdit ? "md" : "lg"} isLoading={loading} disabled={uploading}>
              {uploading ? "Uploading poster..." : isEdit ? "Save Event Changes" : "Publish Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
