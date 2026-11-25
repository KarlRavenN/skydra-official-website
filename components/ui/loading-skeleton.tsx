import React from "react";
import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary/80", className)}
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <LoadingSkeleton className="h-48 w-full rounded-md" />
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <div className="flex justify-between pt-2">
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
