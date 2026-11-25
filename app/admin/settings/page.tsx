import { AdminService } from "@/services/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await AdminService.getLeagueSettings();

  return (
    <div className="max-w-3xl space-y-6">
      <AdminHeader
        title="LEAGUE SETTINGS"
        description="Configure league branding, social links, house rules, and the privacy policy."
      />

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
