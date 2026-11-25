"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RegistrationStatus } from "@/types/database";
import { Trash2, Archive, Loader2 } from "lucide-react";

interface EventRowActionsProps {
  eventId: string;
  currentRegistrationStatus: RegistrationStatus;
  isArchived?: boolean;
}

export function EventRowActions({ eventId, currentRegistrationStatus, isArchived = false }: EventRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const newStatus: RegistrationStatus =
      currentRegistrationStatus === "open" ? "closed" : "open";

    try {
      const res = await fetch(`/api/admin/events/${eventId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_status: newStatus }),
      });
      if (!res.ok) alert("Could not change registration status.");
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle registration:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this event? It moves to Past Events and registration closes.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/archive`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Could not archive the event.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to archive event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Cannot delete event. It may have active registrations.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant={currentRegistrationStatus === "open" ? "destructive" : "secondary"}
        onClick={handleToggle}
        disabled={loading}
        title={currentRegistrationStatus === "open" ? "Close Registration" : "Open Registration"}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : currentRegistrationStatus === "open" ? (
          "Close Reg"
        ) : (
          "Open Reg"
        )}
      </Button>

      {!isArchived && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleArchive}
          disabled={loading}
          title="Archive Event (move to Past Events)"
        >
          <Archive className="w-4 h-4" />
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={loading}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
        title="Delete Event"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
