"use client";

import React from "react";
import Image from "next/image";
import { DigitalTicketPayload } from "@/types/registrations";
import { formatDateTime } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, CheckCircle2, Printer } from "lucide-react";

export interface TicketCardProps {
  ticket: DigitalTicketPayload;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-xl border-2 border-primary/40 bg-zinc-950 text-white shadow-2xl">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-black p-6 border-b border-border text-center space-y-1">
        <span className="text-xs font-black uppercase tracking-widest text-primary">
          Official Digital Pass
        </span>
        <h2 className="text-2xl font-black uppercase tracking-wider font-heading text-white">
          SKYDRA RAP BATTLE LEAGUE
        </h2>
        <p className="text-xs text-muted-foreground">{ticket.eventName}</p>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 space-y-6">
        {/* QR Code Area */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative h-56 w-56 overflow-hidden rounded-lg border-2 border-white/20 bg-white p-2 shadow-inner">
            <Image
              src={ticket.qrCodeDataUrl}
              alt={`Ticket QR Code for ${ticket.ticketCode}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-center">
            <span className="font-mono text-sm font-bold tracking-widest text-primary">
              {ticket.ticketCode}
            </span>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
              Present this QR code at the entrance gate
            </p>
          </div>
        </div>

        {/* Dashed Tear-Off Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-dashed border-zinc-700" />
        </div>

        {/* Attendee & Event Metadata */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start justify-between">
            <span className="text-muted-foreground uppercase font-bold tracking-wider">Attendee</span>
            <span className="font-bold text-white text-right">
              {ticket.attendeeName}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-muted-foreground uppercase font-bold tracking-wider">Event Schedule</span>
            <span className="font-medium text-white text-right">{formatDateTime(ticket.eventDate)}</span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-muted-foreground uppercase font-bold tracking-wider">Venue</span>
            <span className="font-medium text-white text-right max-w-[200px] truncate">
              {ticket.venueName}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground uppercase font-bold tracking-wider">Ticket Status</span>
            <Badge
              variant={
                ticket.status === "checked_in"
                  ? "success"
                  : ticket.status === "cancelled" || ticket.paymentStatus === "rejected"
                  ? "danger"
                  : ticket.paymentStatus === "pending_verification" || ticket.status === "pending"
                  ? "warning"
                  : "default"
              }
            >
              {ticket.status === "checked_in"
                ? "CHECKED IN"
                : ticket.paymentStatus === "rejected"
                ? "PAYMENT REJECTED"
                : ticket.status === "cancelled"
                ? "CANCELLED"
                : ticket.paymentStatus === "pending_verification" || ticket.status === "pending"
                ? "PENDING VERIFICATION"
                : "CONFIRMED"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Ticket Footer Controls */}
      <div className="p-4 bg-zinc-900/60 border-t border-border flex items-center justify-between print:hidden">
        <span className="text-[10px] text-muted-foreground">Screenshots accepted</span>
        <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
