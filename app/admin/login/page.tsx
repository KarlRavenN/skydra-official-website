"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, Lock } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const forbidden = searchParams.get("error") === "forbidden";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid admin credentials.");
      setLoading(false);
      return;
    }

    try {
      router.push(redirectTo);
      router.refresh();
    } finally {
      // The login page can remain mounted if the guard redirects back here
      // (?error=forbidden), so the spinner must always be released.
      setLoading(false);
    }
  };

  // Reset a stuck spinner whenever the guard sends us back with an error.
  useEffect(() => {
    if (forbidden) setLoading(false);
  }, [forbidden]);

  return (
    <Card className="border-border bg-card shadow-2xl">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-black font-heading">
          SKYDRA ORGANIZER PORTAL
        </CardTitle>
        <CardDescription className="text-xs">
          Restricted access for league officials and matchmakers.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {forbidden && !error && (
            <div className="rounded-md bg-amber-950/50 border border-amber-800 p-3 text-xs text-amber-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>This account does not have organizer access. Sign in with an admin account.</span>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-rose-950/50 border border-rose-800 p-3 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="admin-email"
            label="Admin Email"
            type="email"
            required
            placeholder="organizer@skydrabattles.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="admin-password"
            label="Password"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Sign In to Dashboard
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
