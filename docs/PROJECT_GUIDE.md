# SKYDRA Project Guide (v1.1)

Source of truth for how the platform works today. `docs/PROJECT_PLAN.md` is the original plan; where they differ, this guide (the v1.1 decisions) wins.

## What changed in v1.1

| Area | Decision |
| --- | --- |
| Fight card | **Removed.** The poster image is the lineup. The `matchups` table, services, API routes and admin UI are gone. |
| Battles | **New.** `battles` = YouTube battle videos, optionally linked to an event. Public page `/battles`, admin page `/admin/battles`. |
| Navigation | "Battles" replaces "House Rules" in the navbar. `/house-rules` still exists (registration checkbox + footer). |
| Posters | Admin picks a file from the device. The browser uploads it **directly to Supabase Storage** using a signed upload URL (no file passes through Next.js, so Vercel's ~4.5 MB limit does not matter). |
| Registration | Fields exactly as in the plan: full name, Facebook profile, age, contact number, barangay, city, emergency contact + number, House Rules + Privacy agreements. **No email, no stage name.** |
| Privacy | The public anon key cannot read or insert `registrations`. All registration reads/writes use server code with the service role. |
| Timezone | Event dates are entered and shown in Asia/Manila (PHT, UTC+8). |
| Admin security | Middleware, the admin layout and **every** `/api/admin/*` handler verify a Supabase session **and** a row in `admin_profiles`. (Before v1.1 the admin API routes had no login check.) |

## Battles (YouTube)

- Table `battles`: `title`, `youtube_url` (normalized), `youtube_video_id` (derived server-side), `battle_type` (`tournament` | `non_tournament`), `event_id` (nullable, `ON DELETE SET NULL`), `battle_date`, `is_published`.
- URL parsing lives in `lib/utils/youtube.ts`: accepts `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, with or without `www.`/`m.` and extra params. Any other host is rejected. Thumbnail: `https://i.ytimg.com/vi/{id}/hqdefault.jpg`.
- Public `/battles`: featured battle + 2-column grid (left ~60%), "Battle Events" list (right ~40%), filter with `?event=<slug>`, pagination with `?page=` (12 per page). On mobile the event list becomes horizontal chips. All server-rendered.
- The event detail page shows "Battles from this event" when the event has published battles.
- RLS: public can read only `is_published = true`; admins have full access.

## Poster upload flow

1. Admin chooses an image (JPG/PNG/WebP, max 8 MB, validated on the client).
2. Browser calls `POST /api/admin/storage/poster-upload-url` with `{contentType, size}`. The route checks admin, validates type and size again, generates `events/<uuid>.<ext>` (the original file name is never used) and returns a signed upload token.
3. Browser uploads straight to the `posters` bucket with `uploadToSignedUrl`.
4. The returned public URL is saved in `events.poster_url` when the admin saves the event.
5. When a poster is replaced/removed or the event is deleted, the old file is deleted server-side (best effort).
6. Bucket-level limits (8 MB, JPG/PNG/WebP) are set by migration `20261125000005`. There are no INSERT/UPDATE/DELETE policies on `storage.objects`, so only signed URLs can write.

`<PosterImage>` (`components/ui/poster-image.tsx`) is the only component that renders posters. It only passes URLs from allowed hosts to `next/image` and shows a placeholder for empty/unknown/failed URLs, so a bad URL can never crash a page. Keep its host list (`lib/utils/image-hosts.ts`) in sync with `images.remotePatterns` in `next.config.mjs`.

## Registration, tickets, privacy

- Validation: one zod schema (`types/registrations.ts`) used by the form (instant errors) and the API.
- Duplicate rule: one non-cancelled registration per `(event_id, lower(full_name), phone_number)` (database unique index + server check).
- Capacity and open/closed status: checked in `RegistrationService` and again by the database trigger.
- Ticket code: `SKY-<year>-<22 URL-safe chars>` from 16 random bytes (`crypto.randomBytes`). The QR code encodes `/tickets/<code>`.
- Public ticket page shows **only**: ticket ID, QR, attendee name, event info, status.
- Admin: search by name, contact number, ticket code, barangay; filter by event and status; check-in; delete (confirm); CSV export (keeps the active filters).
- CSV export escapes quotes/commas/newlines and prefixes cells starting with `=`, `+`, `-`, `@` with `'` (formula injection).

## Admin access model

1. `middleware.ts` / `lib/supabase/middleware.ts`: `/admin/*` needs a session and an `admin_profiles` row; `/api/admin/*` returns 401/403 JSON otherwise.
2. `app/admin/layout.tsx`: re-checks server-side with `requireAdminPage()` (the login page is exempt).
3. Every admin route handler calls `requireAdminApi()` (`lib/supabase/auth-guard.ts`) before doing anything.

A signed-in user who is not in `admin_profiles` is refused everywhere.

## Migrations (apply in this order)

0. `20261124_init_schema.sql` (already applied)
1. `20261125000001_drop_matchups.sql`: drops `matchups`, its policies/indexes/trigger and the `matchup_status` enum. Destructive.
2. `20261125000002_create_battles.sql`: `battle_type` enum, `battles` table, trigger, indexes, RLS.
3. `20261125000003_update_registrations_schema.sql`: new registration columns, drops `email`/`stage_name`, new unique index. **Deletes existing registrations** (they have no consent/address data).
4. `20261125000004_secure_registrations_rls.sql`: drops the two public policies on `registrations`.
5. `20261125000005_lock_poster_storage.sql`: bucket size/type limits for `posters`.

## Settings

Admin > League Settings edits league info, social links (Facebook, YouTube, TikTok, Instagram), House Rules (one per line) and the Privacy Policy (tiny markup: `## ` heading, `- ` bullet). They are stored in `league_settings` and used by the footer, `/house-rules` and `/privacy`.
