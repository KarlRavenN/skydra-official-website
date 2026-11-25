import { notFound } from "next/navigation";
import Link from "next/link";
import { BattleService } from "@/services/battles";
import { EventService } from "@/services/events";
import { BattleForm } from "@/components/admin/battle-form";
import { isUuid } from "@/lib/utils/api";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface EditBattlePageProps {
  searchParams: { id?: string };
}

export default async function EditBattlePage({ searchParams }: EditBattlePageProps) {
  if (!searchParams.id || !isUuid(searchParams.id)) notFound();

  const [battle, events] = await Promise.all([
    BattleService.getBattleAdmin(searchParams.id),
    EventService.getAllEventsAdmin(),
  ]);
  if (!battle) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/battles"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Battles
      </Link>
      <BattleForm battle={battle} events={events.map((e) => ({ id: e.id, title: e.title }))} />
    </div>
  );
}
