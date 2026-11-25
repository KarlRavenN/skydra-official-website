import { Container } from "@/components/ui/container";
import { PolicyText } from "@/components/ui/policy-text";
import { AdminService } from "@/services/admin";
import { DEFAULT_PRIVACY_POLICY } from "@/lib/content/privacy-default";

export const revalidate = 60;

export const metadata = {
  title: "Privacy Policy | SKYDRA Rap Battle League",
  description: "Privacy policy regarding attendee registration data collection and digital ticketing.",
};

export default async function PrivacyPage() {
  const settings = await AdminService.getLeagueSettings();
  const policy = settings.privacyPolicy || DEFAULT_PRIVACY_POLICY;

  return (
    <div className="py-12 md:py-20">
      <Container size="md" className="space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Data Protection</span>
          <h1 className="text-4xl font-black uppercase tracking-wider text-white font-heading">
            PRIVACY POLICY
          </h1>
        </div>

        <PolicyText text={policy} />
      </Container>
    </div>
  );
}
