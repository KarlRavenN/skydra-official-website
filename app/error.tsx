"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <Container size="sm" className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-950 border border-rose-800 text-rose-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-white">
          SYSTEM INTERRUPTED
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          An error occurred while loading this section of the league portal. Please retry or contact league administration.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Return Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
