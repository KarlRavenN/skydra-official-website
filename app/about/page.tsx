import { Container } from "@/components/ui/container";
import { Swords, Mic2, Shield, Target } from "lucide-react";

export const metadata = {
  title: "About Us | SKYDRA Rap Battle League",
  description: "Learn about SKYDRA Rap Battle League, our mission, origins, and devotion to underground Philippine battle rap.",
};

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="md" className="space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary">League Genesis</span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-white font-heading">
            ABOUT SKYDRA RAP BATTLE LEAGUE
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            SKYDRA is a grassroots underground rap battle platform headquartered in the Philippines, established to champion the unadulterated essence of competitive hip-hop lyricism.
          </p>
        </div>

        {/* Core Philosophy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Mic2 className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Lyrical Prowess</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We reward original rhyme structures, authentic delivery, intricate multi-syllables, and sharp counter-rebuttals. Gimmicks take a back seat to pure penmanship.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Target className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Strict Fairness</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Matchups are judged objectively by seasoned veterans of the Philippine hip-hop movement without favoritism, bias, or predetermined storylines.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Swords className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Underground Platform</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Giving rising underground spitters the opportunity to test their mettle against certified veterans and build their reputation.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Shield className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Culture First</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We operate strictly for the elevation of Philippine battle rap culture, fostering brotherhood outside the ring and fierce competition inside it.
            </p>
          </div>
        </div>

        {/* Rules & Spirit */}
        <div className="rounded-lg border border-border bg-card/60 p-8 space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white font-heading">
            THE CODE OF THE ARENA
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In SKYDRA, the microphone is the only weapon. When two emcees enter the circle, they bring their intellect, their wit, and their hunger. Outside the circle, mutual respect preserves the dignity of the movement.
          </p>
        </div>
      </Container>
    </div>
  );
}
