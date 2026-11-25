"use client";

import React, { useState } from "react";
import { LeagueSettings } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DEFAULT_PRIVACY_POLICY } from "@/lib/content/privacy-default";
import { CheckCircle, AlertCircle } from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: Partial<LeagueSettings> }) {
  const [formData, setFormData] = useState({
    leagueName: initialSettings.leagueName || "SKYDRA Rap Battle League",
    leagueTagline: initialSettings.leagueTagline || "",
    contactEmail: initialSettings.contactEmail || "skydrabattles@gmail.com",
    facebook: initialSettings.socials?.facebook || "",
    youtube: initialSettings.socials?.youtube || "",
    instagram: initialSettings.socials?.instagram || "",
    tiktok: initialSettings.socials?.tiktok || "",
    houseRules: initialSettings.houseRules || "",
    privacyPolicy: initialSettings.privacyPolicy || DEFAULT_PRIVACY_POLICY,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Failed to update settings" });
      } else {
        setFeedback({ type: "success", text: "League settings updated successfully." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div
          className={`rounded-md p-3 text-xs flex items-center space-x-2 border ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
              : "bg-rose-950/40 border-rose-800 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="leagueName"
            label="League Name"
            required
            value={formData.leagueName}
            onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
          />
          <Input
            id="leagueTagline"
            label="Tagline / Arena Slogan"
            value={formData.leagueTagline}
            onChange={(e) => setFormData({ ...formData, leagueTagline: e.target.value })}
          />
          <Input
            id="contactEmail"
            label="Official Contact Email"
            type="email"
            required
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Official Social Media Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="facebook"
            label="Facebook Page URL"
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
          />
          <Input
            id="youtube"
            label="YouTube Channel URL"
            value={formData.youtube}
            onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
          />
          <Input
            id="instagram"
            label="Instagram Profile URL"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          />
          <Input
            id="tiktok"
            label="TikTok Profile URL"
            value={formData.tiktok}
            onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">House Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            id="houseRules"
            rows={8}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={formData.houseRules}
            onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">One rule per line. Shown on the public House Rules page.</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            id="privacyPolicy"
            rows={14}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={formData.privacyPolicy}
            onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">
            Start a line with &quot;## &quot; for a heading and &quot;- &quot; for a bullet. Leave a blank line between sections.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" isLoading={loading}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}
