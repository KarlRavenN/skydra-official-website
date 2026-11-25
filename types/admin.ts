import { AdminRole } from "./database";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl: string | null;
}

export interface DashboardMetrics {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  checkedInAttendees: number;
  upcomingCapacity: number;
  upcomingRegistered: number;
  publishedBattles: number;
  recentRegistrations: Array<{
    id: string;
    fullName: string;
    eventTitle: string;
    ticketCode: string;
    createdAt: string;
  }>;
}

export interface LeagueSettings {
  leagueName: string;
  leagueTagline: string;
  contactEmail: string;
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  houseRules: string;
  privacyPolicy: string;
  aboutText: string;
}
