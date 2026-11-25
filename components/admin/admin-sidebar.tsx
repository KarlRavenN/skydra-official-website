"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Calendar, Users, Settings, LogOut, ArrowUpRight, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/battles", label: "Battles", icon: Swords },
  { href: "/admin/registrations", label: "Registrations & Tickets", icon: Users },
  { href: "/admin/settings", label: "League Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 border-r border-border bg-card/60 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 py-1">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-widest text-white uppercase font-heading">
              SKY<span className="text-primary">DRA</span>
            </span>
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary border border-primary/30">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
        >
          <span>Live Site</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
