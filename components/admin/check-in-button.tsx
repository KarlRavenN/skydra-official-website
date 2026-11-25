"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export function CheckInButton({
  ticketCode,
  isCheckedIn,
}: {
  ticketCode: string;
  isCheckedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    if (isCheckedIn) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to check in attendee");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Check-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckedIn) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-emerald-400 gap-1">
        <Check className="w-3.5 h-3.5" /> Admitted
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCheckIn}
      disabled={loading}
      className="text-xs"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Admit Guest"}
    </Button>
  );
}
