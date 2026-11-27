"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PosterImage } from "@/components/ui/poster-image";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB (also enforced on the server and by the bucket)

export interface PosterUploaderProps {
  /** Current stored image URL ("" when none). */
  value: string;
  onChange: (publicUrl: string) => void;
  /** Lets the parent block "Save" while an upload is running. */
  onUploadingChange?: (uploading: boolean) => void;
  /** Storage folder inside the posters bucket. */
  folder?: "events" | "gcash-qr";
  /** Field label. */
  label?: string;
  /** Preview container aspect & width classes. */
  aspectClassName?: string;
  /** Placeholder text when no image is set. */
  placeholderText?: string;
}

/**
 * Image picker: choose a file from the device (gallery or camera on phones),
 * instant preview, upload straight to Supabase Storage with a signed upload
 * URL issued by /api/admin/storage/poster-upload-url (never through a Next.js
 * route, because of Vercel's ~4.5 MB body limit).
 */
export function PosterUploader({
  value,
  onChange,
  onUploadingChange,
  folder = "events",
  label = "Event Poster",
  aspectClassName = "aspect-[3/4] w-40",
  placeholderText = "NO POSTER",
}: PosterUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large. Maximum size is 8 MB.");
      return;
    }
    if (file.size === 0) {
      setError("That file is empty.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setBusy(true);

    try {
      // 1. Ask our server (admin only) for a signed upload token.
      const res = await fetch("/api/admin/storage/poster-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size, folder }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not prepare the upload.");
      }

      // 2. Upload the file directly to Supabase Storage.
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("posters")
        .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message || "Upload failed.");

      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setLocalPreview(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    setError(null);
    onChange("");
  };

  const hasPoster = !!(localPreview || value);

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className={`relative ${aspectClassName} shrink-0 overflow-hidden rounded-md border border-border bg-input`}>
          {localPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localPreview} alt="Selected image preview" className="h-full w-full object-cover" />
          ) : (
            <PosterImage src={value} alt={label} placeholderText={placeholderText} placeholderClassName="text-xs" sizes="160px" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-2">
          <input
            ref={inputRef}
            id={`uploader-${folder}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              {hasPoster ? "Replace Image" : "Choose Image"}
            </Button>
            {hasPoster && (
              <Button type="button" variant="outline" size="md" disabled={uploading} onClick={handleRemove}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {uploading ? "Uploading..." : "JPG, PNG or WebP, up to 8 MB."}
          </p>
          {error && (
            <p className="flex items-start gap-1.5 text-xs text-rose-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
