import Link from "next/link";
import { AdminService } from "@/services/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Swords, Plus, FileSpreadsheet, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

export const revalidate = 0; // Dynamic data for admin

export default async function AdminDashboardPage() {
  const metrics = await AdminService.getDashboardMetrics();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="LEAGUE DASHBOARD"
        description="Live operational overview of SKYDRA events, battles, and guest registrations."
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Events
            </span>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">{metrics.totalEvents}</div>
            <p className="text-[11px] text-muted-foreground mt-1">All time hosted & planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Events
            </span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">{metrics.upcomingEvents}</div>
            <p className="text-[11px] text-emerald-400 mt-1">Active on fight schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Registrations
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">{metrics.totalRegistrations}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Verified attendee passes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Capacity
            </span>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">
              {metrics.upcomingRegistered}
              <span className="text-lg text-muted-foreground"> / {metrics.upcomingCapacity}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Registered vs. capacity, upcoming events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Checked-In Attendees
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">{metrics.checkedInAttendees}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Admitted at the gate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Published Battles
            </span>
            <Swords className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-white">{metrics.publishedBattles}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Visible on the Battles page</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-lg border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
          Quick Actions:
        </span>
        <Link href="/admin/events/create">
          <Button size="sm" variant="primary" className="gap-1.5">
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        </Link>
        <Link href="/admin/registrations">
          <Button size="sm" variant="secondary" className="gap-1.5">
            <Users className="w-4 h-4" /> Manage Registrations
          </Button>
        </Link>
        <Link href="/admin/events">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Calendar className="w-4 h-4" /> Manage Events
          </Button>
        </Link>
        <Link href="/admin/battles">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Swords className="w-4 h-4" /> Manage Battles
          </Button>
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            Recent Registrations
          </h2>
          <Link href="/admin/registrations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold tracking-wider border-b border-border">
              <tr>
                <th className="p-3">Attendee</th>
                <th className="p-3">Event</th>
                <th className="p-3">Ticket Code</th>
                <th className="p-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.recentRegistrations.length > 0 ? (
                metrics.recentRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-semibold text-white">{reg.fullName}</td>
                    <td className="p-3 text-muted-foreground">{reg.eventTitle}</td>
                    <td className="p-3 font-mono text-primary font-bold">{reg.ticketCode}</td>
                    <td className="p-3 text-muted-foreground">{formatDateTime(reg.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No registrations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
