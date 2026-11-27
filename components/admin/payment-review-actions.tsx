"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PaymentStatus } from "@/types/database";
import { Check, Eye, Loader2, X } from "lucide-react";

interface PaymentReviewActionsProps {
  registrationId: string;
  attendeeName: string;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  paymentScreenshotUrl: string | null;
}

export function PaymentReviewActions({
  registrationId,
  attendeeName,
  paymentStatus,
  paymentReference,
  paymentScreenshotUrl,
}: PaymentReviewActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (paymentStatus === "free") {
    return null;
  }

  const handleReview = async (action: "approve" | "reject") => {
    if (
      action === "reject" &&
      !confirm(`Reject payment for ${attendeeName}? Their registration will be marked cancelled.`)
    ) {
      return;
    }

    setLoadingAction(action);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || `Failed to ${action} payment.`);
        return;
      }
      setPreviewOpen(false);
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {paymentScreenshotUrl && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            title="View uploaded payment screenshot"
            className="gap-1 px-2"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Screenshot</span>
          </Button>
        )}

        {paymentStatus === "pending_verification" && (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loadingAction !== null}
              onClick={() => handleReview("approve")}
              title="Approve payment"
              className="gap-1 px-2 text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300 border border-emerald-800/60"
            >
              {loadingAction === "approve" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Approve</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={loadingAction !== null}
              onClick={() => handleReview("reject")}
              title="Reject payment"
              className="gap-1 px-2 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300"
            >
              {loadingAction === "reject" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Reject</span>
            </Button>
          </>
        )}
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Payment Proof"
        description={attendeeName}
      >
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-input/60 p-3 flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider font-bold text-muted-foreground">
              Reference Number
            </span>
            <span className="font-mono font-bold text-white">
              {paymentReference || "Not provided"}
            </span>
          </div>

          {paymentScreenshotUrl ? (
            <div className="overflow-hidden rounded-lg border border-border bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={paymentScreenshotUrl}
                alt={`Payment screenshot from ${attendeeName}`}
                className="w-full max-h-[60vh] object-contain mx-auto"
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No screenshot uploaded.
            </p>
          )}

          {paymentStatus === "pending_verification" && (
            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="danger"
                size="md"
                className="flex-1 gap-1.5"
                disabled={loadingAction !== null}
                onClick={() => handleReview("reject")}
              >
                {loadingAction === "reject" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Reject Payment
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                disabled={loadingAction !== null}
                onClick={() => handleReview("approve")}
              >
                {loadingAction === "approve" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Approve Payment
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
