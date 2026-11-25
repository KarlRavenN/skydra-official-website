import Link from "next/link";
import { EventService } from "@/services/events";
import { BattleForm } from "@/components/admin/battle-form";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function CreateBattlePage() {
  const events = await EventService.getAllEventsAdmin();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/battles"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Battles
      </Link>
      <BattleForm events={events.map((e) => ({ id: e.id, title: e.title }))} />
    </div>
  );
}
