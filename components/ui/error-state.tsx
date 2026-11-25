import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this section.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-rose-900/50 bg-rose-950/20 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-950 text-rose-500 mb-4 border border-rose-800">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold uppercase tracking-wider text-rose-400">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
