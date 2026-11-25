import React from "react";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminPage } from "@/lib/supabase/auth-guard";

export const metadata = {
  title: "Admin Portal | SKYDRA Rap Battle League",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The login page lives under /admin but must stay reachable (middleware sets this header).
  const pathname = headers().get("x-skydra-pathname") || "";
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  // Defense in depth: middleware already checked, this re-checks session + admin_profiles server-side.
  await requireAdminPage();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
