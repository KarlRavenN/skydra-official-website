import { notFound } from "next/navigation";
import Link from "next/link";
import { RegistrationService } from "@/services/registrations";
import { Container } from "@/components/ui/container";
import { TicketCard } from "@/components/events/ticket-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface TicketPageProps {
  params: {
    ticketCode: string;
  };
}

export async function generateMetadata({ params }: TicketPageProps) {
  return {
    title: `Digital Pass: ${params.ticketCode} | SKYDRA`,
    description: "Official SKYDRA Rap Battle League Digital Admission Pass.",
  };
}

export default async function DigitalTicketPage({ params }: TicketPageProps) {
  const ticket = await RegistrationService.getTicketByCode(params.ticketCode);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="py-12 md:py-16">
      <Container size="sm" className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <span className="text-xs font-mono text-muted-foreground">
            Verified Pass
          </span>
        </div>

        <TicketCard ticket={ticket} />

        <div className="rounded-lg border border-border bg-card/60 p-4 text-center text-xs text-muted-foreground space-y-1 print:hidden">
          <p className="font-semibold text-white">Entry Instructions</p>
          <p>
            Keep this page bookmarked or save a screenshot on your mobile device. Have your valid ID ready upon arrival at the venue.
          </p>
        </div>
      </Container>
    </div>
  );
}
