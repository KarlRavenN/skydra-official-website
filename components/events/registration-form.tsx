"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DigitalTicketPayload,
  RegistrationFieldErrors,
  registrationFormSchema,
} from "@/types/registrations";
import { getEmailValidationError } from "@/lib/utils/email-validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketCard } from "./ticket-card";
import { PaymentScreen } from "./payment-screen";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";

export interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  ticketPrice: number;
  gcashQrUrl?: string | null;
  gcashAccountName?: string | null;
  gcashNumber?: string | null;
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onCompleteChange?: (completed: boolean) => void;
  onCloseRequest?: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  facebookProfile: string;
  age: string;
  phoneNumber: string;
  houseRulesAccepted: boolean;
  privacyAccepted: boolean;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  facebookProfile: "",
  age: "",
  phoneNumber: "",
  houseRulesAccepted: false,
  privacyAccepted: false,
};

export function RegistrationForm({
  eventId,
  eventTitle,
  ticketPrice,
  gcashQrUrl,
  gcashAccountName,
  gcashNumber,
  onSuccess,
  onDirtyChange,
  onCompleteChange,
  onCloseRequest,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<DigitalTicketPayload | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{
    registrationId: string;
    ticketCode: string;
  } | null>(null);

  useEffect(() => {
    const isDirty =
      formData.fullName.trim() !== "" ||
      formData.email.trim() !== "" ||
      formData.facebookProfile.trim() !== "" ||
      formData.age.trim() !== "" ||
      formData.phoneNumber.trim() !== "" ||
      formData.houseRulesAccepted ||
      formData.privacyAccepted;
    onDirtyChange?.(isDirty);
  }, [formData, onDirtyChange]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    if (value.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      return;
    }
    const err = getEmailValidationError(value);
    setFieldErrors((prev) => ({ ...prev, email: err || undefined }));
  };

  const handleEmailBlur = async () => {
    const trimmed = formData.email.trim();
    if (!trimmed) return;
    const syntaxErr = getEmailValidationError(trimmed);
    if (syntaxErr) {
      setFieldErrors((prev) => ({ ...prev, email: syntaxErr }));
      return;
    }

    try {
      const res = await fetch("/api/registrations/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!data.valid) {
        setFieldErrors((prev) => ({
          ...prev,
          email: data.error || "Email domain cannot receive emails",
        }));
      }
    } catch {
      // Ignore network hiccup on blur; server will verify on submit
    }
  };

  const handlePhoneChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 11);
    setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));

    if (digitsOnly.length > 0 && !digitsOnly.startsWith("09")) {
      setFieldErrors((prev) => ({
        ...prev,
        phoneNumber: "Contact number must start with 09",
      }));
    } else if (digitsOnly.length > 0 && digitsOnly.length < 11) {
      setFieldErrors((prev) => ({
        ...prev,
        phoneNumber: "Contact number must be exactly 11 digits",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const handlePreConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = { eventId, ...formData };
    const check = registrationFormSchema.safeParse(payload);
    if (!check.success) {
      const errors: RegistrationFieldErrors = {};
      for (const issue of check.error.issues) {
        const key = issue.path[0] as keyof RegistrationFieldErrors;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setErrorMessage("Please fix the highlighted fields.");
      return;
    }

    setValidatingEmail(true);
    try {
      const res = await fetch("/api/registrations/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setFieldErrors((prev) => ({
          ...prev,
          email: data.error || "Please enter a valid email address",
        }));
        setErrorMessage("Please fix the highlighted fields.");
        return;
      }
    } catch {
      // Proceed to confirmation; server will validate on submit
    } finally {
      setValidatingEmail(false);
    }

    setShowConfirmDialog(true);
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    setLoading(true);
    const payload = { eventId, ...formData };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setShowConfirmDialog(false);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setErrorMessage(result.error || "Failed to complete registration.");
        return;
      }

      setShowConfirmDialog(false);

      if (result.requiresPayment && result.registrationId) {
        setPendingPayment({
          registrationId: result.registrationId,
          ticketCode: result.ticketCode,
        });
        return;
      }

      setTicketResult(result.ticket);
      onCompleteChange?.(true);
      onSuccess?.();
    } catch (err: any) {
      setShowConfirmDialog(false);
      setErrorMessage(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingPayment) {
    return (
      <PaymentScreen
        registrationId={pendingPayment.registrationId}
        eventTitle={eventTitle}
        ticketPrice={ticketPrice}
        gcashQrUrl={gcashQrUrl}
        gcashAccountName={gcashAccountName}
        gcashNumber={gcashNumber}
        onSubmitted={() => {
          onCompleteChange?.(true);
          onSuccess?.();
        }}
        onClose={() => onCloseRequest?.()}
      />
    );
  }

  if (ticketResult) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-4 text-center space-y-1.5">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-emerald-400">
            Registration Confirmed!
          </h3>
          <p className="text-xs text-muted-foreground">
            Your official digital pass is ready below and has been sent to your email.
          </p>
          <p className="text-xs text-amber-200/90 pt-1">
            Please check your Inbox and Spam folder if you don&apos;t immediately receive our email.
          </p>
        </div>

        <TicketCard ticket={ticketResult} />
      </div>
    );
  }

  return (
    <div className="relative">
      <form onSubmit={handlePreConfirm} className="space-y-4" noValidate>
        {errorMessage && (
          <div className="rounded-md bg-rose-950/50 border border-rose-800 p-3 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          id="fullName"
          label="Full Name"
          required
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          value={formData.fullName}
          error={fieldErrors.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
        />

        <div className="space-y-1.5">
          <Input
            id="email"
            label="Gmail Address"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            placeholder="juan.delacruz@gmail.com"
            value={formData.email}
            error={fieldErrors.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Please use an email account that contains your real name. You may be asked to present a valid ID at the event entrance.
          </p>
        </div>

        <Input
          id="facebookProfile"
          label="Facebook Profile (link or name)"
          required
          placeholder="facebook.com/juan.delacruz"
          value={formData.facebookProfile}
          error={fieldErrors.facebookProfile}
          onChange={(e) => setField("facebookProfile", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="age"
            label="Age"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            required
            placeholder="21"
            value={formData.age}
            error={fieldErrors.age}
            onChange={(e) => setField("age", e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              id="phoneNumber"
              label="Contact Number"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              required
              autoComplete="tel-national"
              placeholder="09171234567"
              value={formData.phoneNumber}
              error={fieldErrors.phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-border bg-input/40 p-3">
          <div className="space-y-1">
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={formData.houseRulesAccepted}
                onChange={(e) => setField("houseRulesAccepted", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/house-rules" target="_blank" className="text-primary hover:underline">
                  House Rules
                </Link>
                .
              </span>
            </label>
            {fieldErrors.houseRulesAccepted && (
              <p className="text-xs text-rose-500">{fieldErrors.houseRulesAccepted}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={formData.privacyAccepted}
                onChange={(e) => setField("privacyAccepted", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
              />
              <span>
                I agree to the{" "}
                <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and the collection of my details for this event.
              </span>
            </label>
            {fieldErrors.privacyAccepted && (
              <p className="text-xs text-rose-500">{fieldErrors.privacyAccepted}</p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full uppercase"
            isLoading={validatingEmail}
          >
            CONFIRM &amp; GENERATE TICKET
          </Button>
        </div>
      </form>

      {/* Pre-Submission Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-950/60 border border-amber-700/60 p-2 shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black uppercase tracking-wider text-white font-heading">
                  Confirm Registration
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Please make sure all information you entered is correct.
                </p>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Incorrect information may delay verification or invalidate your ticket.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="flex-1"
                disabled={loading}
                onClick={() => setShowConfirmDialog(false)}
              >
                Go Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="flex-1"
                isLoading={loading}
                onClick={handleFinalSubmit}
              >
                Yes, Submit Registration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
