"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

interface BattleRowActionsProps {
  battleId: string;
  isPublished: boolean;
}

export function BattleRowActions({ battleId, isPublished }: BattleRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/battles/${battleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) alert(data.error || "Could not update the battle.");
      else router.refresh();
    } catch {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this battle? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/battles/${battleId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) alert(data.error || "Could not delete the battle.");
      else router.refresh();
    } catch {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={togglePublish}
        disabled={loading}
        title={isPublished ? "Unpublish" : "Publish"}
        className="gap-1"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPublished ? (
          <>
            <EyeOff className="w-3.5 h-3.5" /> Unpublish
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5" /> Publish
          </>
        )}
      </Button>
      <Link href={`/admin/battles/edit?id=${battleId}`}>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </Button>
      </Link>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={loading}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
        title="Delete Battle"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
