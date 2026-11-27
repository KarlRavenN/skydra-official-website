"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PosterImage } from "@/components/ui/poster-image";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ImagePlus,
  Loader2,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

export interface PaymentScreenProps {
  registrationId: string;
  eventTitle: string;
  ticketPrice: number;
  gcashQrUrl?: string | null;
  gcashAccountName?: string | null;
  gcashNumber?: string | null;
  onSubmitted: () => void;
  onClose: () => void;
}

export function PaymentScreen({
  registrationId,
  eventTitle,
  ticketPrice,
  gcashQrUrl,
  gcashAccountName,
  gcashNumber,
  onSubmitted,
  onClose,
}: PaymentScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleCopyNumber = async () => {
    if (!gcashNumber) return;
    try {
      await navigator.clipboard.writeText(gcashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Screenshot is too large. Maximum size is 8 MB.");
      return;
    }
    if (file.size === 0) {
      setError("That file is empty.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await fetch("/api/registrations/payment-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          contentType: file.type,
          size: file.size,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not prepare screenshot upload.");
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(data.bucket || "payment-screenshots")
        .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type });

      if (uploadError) {
        throw new Error(uploadError.message || "Screenshot upload failed.");
      }

      setScreenshotUrl(data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setLocalPreview(null);
      setScreenshotUrl("");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!referenceNumber.trim() || referenceNumber.trim().length < 4) {
      setError("Please enter your GCash reference number.");
      return;
    }
    if (!screenshotUrl) {
      setError("Please upload your GCash payment screenshot.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/registrations/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          paymentReference: referenceNumber.trim(),
          paymentScreenshotUrl: screenshotUrl,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit payment proof.");
        return;
      }

      setSubmitted(true);
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-5 py-2 text-center animate-in fade-in duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-700/60">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-wider text-white font-heading">
            Payment Submitted
          </h3>
          <p className="text-sm text-zinc-200">
            Your payment is now waiting for staff verification.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We will email you once your payment has been approved.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you have any concerns, contact us through our Facebook Page.
          </p>
        </div>

        <div className="rounded-md border border-amber-800/50 bg-amber-950/30 p-3 text-xs text-amber-200">
          Please check both your Inbox and Spam folder for future emails.
        </div>

        <Button type="button" variant="primary" size="lg" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
            Ticket Amount Due
          </span>
          <span className="text-xs text-zinc-300">{eventTitle}</span>
        </div>
        <span className="text-lg font-black text-white">{formatCurrency(ticketPrice)}</span>
      </div>

      {/* Organizer GCash Details */}
      <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
          <QrCode className="h-4 w-4 text-primary" />
          <span>Send Payment via GCash</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-white/5">
            <PosterImage
              src={gcashQrUrl}
              alt="Organizer GCash QR"
              placeholderText="GCASH QR"
              placeholderClassName="text-xs"
              sizes="160px"
            />
          </div>

          <div className="w-full space-y-2.5 text-xs">
            <div className="rounded-md border border-border bg-input/60 p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                GCash Account Name
              </span>
              <span className="font-bold text-white text-sm">
                {gcashAccountName || "SKYDRA Official"}
              </span>
            </div>

            <div className="rounded-md border border-border bg-input/60 p-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  GCash Number
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {gcashNumber || "Contact organizer on Facebook"}
                </span>
              </div>
              {gcashNumber && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyNumber}
                  className="shrink-0 gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-950/50 border border-rose-800 p-3 text-xs text-rose-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Input
        id="paymentReference"
        label="GCash Reference Number"
        required
        placeholder="e.g. 9012 345 678901"
        value={referenceNumber}
        onChange={(e) => setReferenceNumber(e.target.value)}
      />

      {/* Payment Screenshot Upload */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Payment Screenshot <span className="text-primary">*</span>
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading || submitting}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <div className="flex items-center gap-4 rounded-lg border border-dashed border-border bg-input/40 p-3">
          {localPreview ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localPreview}
                alt="Payment screenshot preview"
                className="h-full w-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : null}

          <div className="flex-1 space-y-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading || submitting}
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              <ImagePlus className="w-4 h-4" />
              {screenshotUrl ? "Replace Screenshot" : "Upload Screenshot"}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              {uploading
                ? "Uploading screenshot..."
                : screenshotUrl
                ? "Screenshot uploaded and ready."
                : "JPG, PNG or WebP up to 8 MB."}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full gap-2"
        isLoading={submitting}
        disabled={uploading}
      >
        <ShieldCheck className="w-4 h-4" />
        Submit Payment Proof
      </Button>
    </form>
  );
}
