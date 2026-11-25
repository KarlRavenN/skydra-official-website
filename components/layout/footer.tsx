import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AdminService } from "@/services/admin";

const SOCIAL_LABELS: Array<{ key: "facebook" | "youtube" | "tiktok" | "instagram"; label: string }> = [
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram" },
];

export async function Footer() {
  const settings = await AdminService.getLeagueSettings();
  const socials = SOCIAL_LABELS.filter(({ key }) => !!settings.socials?.[key]);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/60 text-muted-foreground text-sm">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-widest text-white uppercase font-heading">
                SKY<span className="text-primary">DRA</span>
              </span>
            </Link>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              SKYDRA Rap Battle League is an underground hip-hop arena in the Philippines dedicated to raw lyricism, wordplay, and competitive rap battles.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Respect the art. Respect the pit. No violence. Pure bars.
            </p>
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wider">
                {socials.map(({ key, label }) => (
                  <li key={key}>
                    <a
                      href={settings.socials?.[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  Upcoming & Past Events
                </Link>
              </li>
              <li>
                <Link href="/battles" className="hover:text-primary transition-colors">
                  Battles
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About League
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Organizers
                </Link>
              </li>
            </ul>
          </div>

          {/* League Rules & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Guidelines</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/house-rules" className="hover:text-primary transition-colors">
                  Event House Rules
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-xs">
                  Organizer Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} SKYDRA Rap Battle League. All rights reserved.</p>
          <p className="text-muted-foreground/60">Built for the underground battle rap community.</p>
        </div>
      </Container>
    </footer>
  );
}
