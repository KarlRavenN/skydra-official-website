import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "SKYDRA Rap Battle League | Official Platform",
    template: "%s | SKYDRA Rap Battle League",
  },
  description:
    "Official website of SKYDRA Rap Battle League. Explore upcoming underground rap battles, event schedules, battle videos, and digital tickets.",
  keywords: ["Rap Battle", "Philippines Battle Rap", "SKYDRA", "Underground Hip Hop", "FlipTop", "Bars", "Emcees"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
