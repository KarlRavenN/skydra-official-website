import { Container } from "@/components/ui/container";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { AdminService } from "@/services/admin";

export const revalidate = 60;

export const metadata = {
  title: "House Rules & Guidelines | SKYDRA Rap Battle League",
  description: "Official venue and event guidelines for attendees and participants of SKYDRA Rap Battle League.",
};

const allowedRules = [
  "Valid digital ticket pass and government/school ID required for entry.",
  "Cheering, reacting, and crowd engagement are encouraged during punchlines.",
  "Respect the designated battle area and pit boundaries at all times.",
  "Follow instructions given by league security and venue personnel.",
  "Support local hip-hop merch and official league concessionaires.",
];

const prohibitedRules = [
  "STRICTLY NO physical violence, shoving, or threatening behavior inside or outside the venue.",
  "NO outside alcoholic beverages, illegal substances, or weapons of any kind.",
  "NO interrupting or shouting over an emcee while they are actively delivering their round.",
  "NO unauthorized live streaming of full battles (short social clips and photos permitted).",
  "NO re-entry without event gatekeeper wristband and ticket scan verification.",
];

export default async function HouseRulesPage() {
  // Rules edited in Admin > League Settings take priority over the built-in defaults below.
  const settings = await AdminService.getLeagueSettings();
  const customRules = (settings.houseRules || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <div className="py-12 md:py-20">
      <Container size="md" className="space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Venue Protocol</span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-white font-heading">
            OFFICIAL HOUSE RULES
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To ensure the safety, integrity, and focus of every live battle, all guests, emcees, and crew must strictly adhere to the following league regulations.
          </p>
        </div>

        {customRules.length > 0 ? (
          <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-black uppercase tracking-wider">League House Rules</h2>
            </div>
            <ul className="space-y-3">
              {customRules.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-emerald-200/90 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prohibited Section */}
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-black uppercase tracking-wider">Zero Tolerance / Prohibited</h2>
            </div>
            <ul className="space-y-3">
              {prohibitedRules.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-rose-200/90 leading-relaxed">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidelines Section */}
          <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-black uppercase tracking-wider">Attendee Guidelines</h2>
            </div>
            <ul className="space-y-3">
              {allowedRules.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-emerald-200/90 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        <div className="rounded-lg border border-border bg-card p-6 text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-white uppercase mb-1">Right of Admission Reserved</p>
          SKYDRA Rap Battle League management reserves the right to eject any individual who violates these house rules without refund.
        </div>
      </Container>
    </div>
  );
}
