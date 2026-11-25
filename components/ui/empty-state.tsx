import React from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionHref,
  actionLabel,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
        {icon || <AlertCircle className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button variant="secondary" size="sm">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
