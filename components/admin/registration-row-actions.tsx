"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckInButton } from "@/components/admin/check-in-button";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";
import { PaymentStatus } from "@/types/database";
import { Loader2, Trash2 } from "lucide-react";

interface RegistrationRowActionsProps {
  registrationId: string;
  ticketCode: string;
  isCheckedIn: boolean;
  attendeeName: string;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  paymentScreenshotUrl: string | null;
}

/** Payment review + Check-in + delete (with confirm) for one registration row. */
export function RegistrationRowActions({
  registrationId,
  ticketCode,
  isCheckedIn,
  attendeeName,
  paymentStatus,
  paymentReference,
  paymentScreenshotUrl,
}: RegistrationRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete the registration of ${attendeeName}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) alert(data.error || "Could not delete the registration.");
      else router.refresh();
    } catch {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const canCheckIn = paymentStatus === "free" || paymentStatus === "approved";

  return (
    <div className="flex items-center justify-end flex-wrap gap-2">
      <PaymentReviewActions
        registrationId={registrationId}
        attendeeName={attendeeName}
        paymentStatus={paymentStatus}
        paymentReference={paymentReference}
        paymentScreenshotUrl={paymentScreenshotUrl}
      />
      {canCheckIn && <CheckInButton ticketCode={ticketCode} isCheckedIn={isCheckedIn} />}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={loading}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
        title="Delete registration"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
