SKYDRA Official Website
Project Planning & Development Guide
Version: 1.1 (v1.0 plus the decisions listed in docs/PROJECT_GUIDE.md)

v1.1 CHANGES (override anything below that disagrees):
- Matchups / fight card is REMOVED. The event poster is enough. Battles (YouTube videos) are added instead.
- Navigation: "Battles" replaces "House Rules" (House Rules stays reachable from registration + footer).
- Posters are uploaded from the admin's device (direct to Supabase Storage with a signed URL).
- Registration data is private: server-side access only, unguessable ticket codes.

1. Project Overview
Official website for SKYDRA Rap Battle League, an underground rap battle organization in the Philippines. Fans can view upcoming events, register for free or paid events, receive digital tickets, watch battles, browse past events and learn about SKYDRA. Mobile-first (most visitors arrive from Facebook links). Long-term goal: a professional platform similar to FlipTop's website with SKYDRA's own underground identity.

2. Project Goals
Primary: official online presence; registration without accounts; digital tickets; help organizers manage attendance; archive every event.
Future: paid ticketing, merchandise, rapper profiles, rankings, livestream pages, event media galleries.

3. Design Direction
Underground hip-hop, graffiti, street culture, raw, authentic. NOT corporate: battle flyers, spray paint, concrete walls, stickers, torn posters, urban photography. Clean enough to stay professional.

4. Target Audience
Fans, attendees, new viewers from Facebook, partner cafes, sponsors. Admin users: SKYDRA organizers and event staff. No public user accounts; only admins have accounts.

5. Core Features (Phase 1)
Home Page: hero, upcoming event, event cards, about SKYDRA, social links.
Event Page: poster, title, date, time, venue, Google Maps, battles from this event (YouTube), Register button (hidden/disabled when registration is closed or the event is full).
Battles Page: featured battle, grid, "Battle Events" filter, pagination.
Registration (guest only, no login): Full Name, Facebook Profile, Age, Contact Number, Barangay, City, Emergency Contact, Emergency Contact Number, House Rules Agreement, Privacy Agreement.
After submitting: digital ticket with Ticket ID, QR code, event information, attendee name.
Past Events: archive with poster (photos/videos in the future).

6. Admin Dashboard (Phase 2)
Dashboard: event statistics, registration count, capacity, checked-in attendees, published battles.
Events: create, edit, archive (status "past"), poster upload.
Registrations: search attendees, export CSV, check-in, delete.
Battles: add, edit, publish/unpublish, delete, link to an event.
Settings: league information, social links, House Rules, Privacy Policy.

7. Database Plan
Events (information, venue, poster, capacity, registration status, ticket type).
Battles (YouTube battles, optional event link). Replaces Matchups.
Registrations (attendee information; each belongs to one event; private).
Admins (organizer accounts only).

8. Technology Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS.
Backend: Supabase (PostgreSQL, Storage, Authentication for admins only).
Hosting: GitHub, Vercel.
Additional: QR code generator, Google Maps.

9. Development Philosophy
Simplicity, fast loading, mobile-first, easy maintenance, scalability. Avoid unnecessary complexity. Every feature should solve a real problem.

10. Development Roadmap
Phase 1 Foundation, Phase 2 Public Website, Phase 3 Registration, Phase 4 Admin Dashboard, Phase 5 Visual Polish (animations, graffiti styling, performance, SEO, accessibility).

11. Coding Standards
Reusable components, no duplicated code, organized files, TypeScript everywhere, responsive UI, clean architecture, prefer server-side features, maintainable code over quick fixes.

12. Current Scope
MVP only. Included: homepage, event listing, event details, battles page, registration form, digital tickets, admin event/battle/registration management.
Not included yet: online payments, merchandise, rankings, rapper profiles, livestream integration, community accounts, comments, notifications.

13. Important Reminder for Future AI Sessions
Preserve the existing architecture; do not replace technologies unless necessary; build incrementally; avoid unnecessary dependencies; prioritize clean production-ready code; keep the design consistent with the underground SKYDRA identity; explain major architectural decisions before implementing them; treat this document plus docs/PROJECT_GUIDE.md as the source of truth.
