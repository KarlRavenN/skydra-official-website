import { Container } from "@/components/ui/container";
import { Mail, MessageSquare, Instagram, Youtube, Facebook } from "lucide-react";

export const metadata = {
  title: "Contact & Booking | SKYDRA Rap Battle League",
  description: "Contact SKYDRA Rap Battle League for match inquiries, sponsorships, media coverage, and league coordination.",
};

export default function ContactPage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="md" className="space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Inquiries & Media</span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-white font-heading">
            CONNECT WITH SKYDRA
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reach out to our matchmakers and event production team for emcee tryouts, event sponsorships, media coverage credentials, and general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-2">
            <Mail className="w-6 h-6 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Official Email</h3>
            <p className="text-xs text-muted-foreground">General inquiries, partnership proposals, and tickets</p>
            <p className="font-mono text-xs text-primary pt-2">skydrabattles@gmail.com</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Emcee Submissions</h3>
            <p className="text-xs text-muted-foreground">Submit your verse link or acapella video demo</p>
            <p className="font-mono text-xs text-primary pt-2">tryouts@skydrabattles.com</p>
          </div>
        </div>

        {/* Social Channels */}
        <div className="rounded-lg border border-border bg-card/60 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Official Social Channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-md border border-border bg-card p-3 hover:border-primary transition-colors text-muted-foreground hover:text-white"
            >
              <Facebook className="w-4 h-4 text-blue-500" />
              <span>Facebook / SKYDRA PH</span>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-md border border-border bg-card p-3 hover:border-primary transition-colors text-muted-foreground hover:text-white"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube / SKYDRA Battles</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-md border border-border bg-card p-3 hover:border-primary transition-colors text-muted-foreground hover:text-white"
            >
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>Instagram / @skydraph</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
