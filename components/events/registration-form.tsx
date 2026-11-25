"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DigitalTicketPayload,
  RegistrationFieldErrors,
  registrationFormSchema,
} from "@/types/registrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketCard } from "./ticket-card";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

interface FormState {
  fullName: string;
  facebookProfile: string;
  age: string;
  phoneNumber: string;
  barangay: string;
  city: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  houseRulesAccepted: boolean;
  privacyAccepted: boolean;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  facebookProfile: "",
  age: "",
  phoneNumber: "",
  barangay: "",
  city: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  houseRulesAccepted: false,
  privacyAccepted: false,
};

export function RegistrationForm({ eventId, onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<DigitalTicketPayload | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = { eventId, ...formData };

    // Instant client-side validation with the same schema the server uses.
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

    setLoading(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setErrorMessage(result.error || "Failed to complete registration.");
        return;
      }

      setTicketResult(result.ticket);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (ticketResult) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-4 text-center space-y-1">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-emerald-400">
            Registration Confirmed!
          </h3>
          <p className="text-xs text-muted-foreground">
            Save your digital pass below. You will be required to present this QR code at the door.
          </p>
        </div>

        <TicketCard ticket={ticketResult} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="0917 123 4567"
            value={formData.phoneNumber}
            error={fieldErrors.phoneNumber}
            onChange={(e) => setField("phoneNumber", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="barangay"
          label="Barangay"
          required
          placeholder="Brgy. Poblacion"
          value={formData.barangay}
          error={fieldErrors.barangay}
          onChange={(e) => setField("barangay", e.target.value)}
        />
        <Input
          id="city"
          label="City"
          required
          placeholder="Muntinlupa"
          value={formData.city}
          error={fieldErrors.city}
          onChange={(e) => setField("city", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="emergencyContactName"
          label="Emergency Contact"
          required
          placeholder="Maria Dela Cruz"
          value={formData.emergencyContactName}
          error={fieldErrors.emergencyContactName}
          onChange={(e) => setField("emergencyContactName", e.target.value)}
        />
        <Input
          id="emergencyContactNumber"
          label="Emergency Contact Number"
          type="tel"
          inputMode="tel"
          required
          placeholder="0918 765 4321"
          value={formData.emergencyContactNumber}
          error={fieldErrors.emergencyContactNumber}
          onChange={(e) => setField("emergencyContactNumber", e.target.value)}
        />
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
          {fieldErrors.privacyAccepted && <p className="text-xs text-rose-500">{fieldErrors.privacyAccepted}</p>}
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          Confirm & Generate Ticket
        </Button>
      </div>
    </form>
  );
}
