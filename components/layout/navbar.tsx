"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Menu, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/battles", label: "Battles" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-widest text-white uppercase font-heading">
            SKY<span className="text-primary">DRA</span>
          </span>
          <span className="hidden sm:inline-block rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border">
            Rap Battle League
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold tracking-wider uppercase">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  isActive ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <Link href="/events" className="hidden sm:block">
            <Button size="sm" variant="primary">
              View Events
            </Button>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block py-2 text-sm font-bold uppercase tracking-wider transition-colors",
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/events" onClick={() => setMobileMenuOpen(false)}>
              <Button size="md" variant="primary" className="w-full">
                View Events
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
