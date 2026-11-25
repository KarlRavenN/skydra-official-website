# Changelog

## v1.1

- Removed the fight card (matchups). Poster image is the lineup.
- Added Battles: YouTube battle videos (`/battles`, `/admin/battles`), shown on event pages too.
- Navbar: "Battles" replaces "House Rules" (page still reachable from registration and footer).
- Poster upload from device with direct-to-Storage signed uploads; old posters are cleaned up.
- `<PosterImage>` placeholder component: bad poster URLs can no longer crash pages.
- Event dates/times entered and displayed in Asia/Manila.
- Registration matches the planning doc (no email, no stage name); duplicate prevention by name + contact number.
- Unguessable ticket codes; public ticket page shows only ticket id, QR, name, event info, status.
- Public access to registrations revoked; all access is server-side.
- Admin API routes now require an admin session (they previously had no check).
- Admin: registrations search/filter/delete, CSV export with formula-injection protection, archive events, dashboard stats, settings for house rules and privacy policy.

## v0.1

Repository Created

Planning Documents Added
