"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RegistrationForm } from "./registration-form";
import { Ticket } from "lucide-react";

interface EventRegistrationModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function EventRegistrationModal({
  eventId,
  eventTitle,
  disabled = false,
  disabledReason,
}: EventRegistrationModalProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (disabled) {
    return (
      <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto">
        {disabledReason || "Registration Closed"}
      </Button>
    );
  }

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
        onClose={() => setModalOpen(false)}
        title="Event Registration"
        description={eventTitle}
      >
        <RegistrationForm
          eventId={eventId}
          eventTitle={eventTitle}
          onSuccess={() => {
            // Optional callback
          }}
        />
      </Modal>
    </>
  );
}
