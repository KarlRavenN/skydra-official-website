"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RegistrationForm } from "./registration-form";
import { AlertTriangle, Ticket } from "lucide-react";

interface EventRegistrationModalProps {
  eventId: string;
  eventTitle: string;
  ticketPrice: number;
  gcashQrUrl?: string | null;
  gcashAccountName?: string | null;
  gcashNumber?: string | null;
  isOpen?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function EventRegistrationModal({
  eventId,
  eventTitle,
  ticketPrice,
  gcashQrUrl,
  gcashAccountName,
  gcashNumber,
  disabled = false,
  disabledReason,
}: EventRegistrationModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [formKey, setFormKey] = useState(0);

  if (disabled) {
    return (
      <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto">
        {disabledReason || "Registration Closed"}
      </Button>
    );
  }

  const closeAndReset = () => {
    setShowCloseConfirm(false);
    setModalOpen(false);
    setHasUnsavedData(false);
    setIsCompleted(false);
    setFormKey((k) => k + 1);
  };

  const handleRequestClose = () => {
    if (hasUnsavedData && !isCompleted) {
      setShowCloseConfirm(true);
      return;
    }
    closeAndReset();
  };

  return (
    <>
      <Button
        size="lg"
        variant="primary"
        onClick={() => setModalOpen(true)}
        className="w-full sm:w-auto gap-2"
      >
        <Ticket className="w-5 h-5" />
        Register for Event
      </Button>

      <Modal
        isOpen={modalOpen}
        onClose={handleRequestClose}
        title="Event Registration"
        description={eventTitle}
      >
        <RegistrationForm
          key={formKey}
          eventId={eventId}
          eventTitle={eventTitle}
          ticketPrice={ticketPrice}
          gcashQrUrl={gcashQrUrl}
          gcashAccountName={gcashAccountName}
          gcashNumber={gcashNumber}
          onDirtyChange={setHasUnsavedData}
          onCompleteChange={setIsCompleted}
          onCloseRequest={closeAndReset}
        />
      </Modal>

      {showCloseConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-950/60 border border-rose-800/60 p-2 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black uppercase tracking-wider text-white font-heading">
                  Are you sure?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Closing this window will discard all entered information.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You&apos;ll need to fill out the registration form again.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setShowCloseConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="flex-1"
                onClick={closeAndReset}
              >
                Close Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
