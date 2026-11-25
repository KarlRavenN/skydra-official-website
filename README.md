# SKYDRA Rap Battle League - Platform Backbone & Architecture

Welcome to the official codebase for **SKYDRA Rap Battle League**, the premier underground rap battle platform based in the Philippines.

This repository represents the **complete architectural backbone (foundation)** designed for long-term scalability, strict maintainability, and seamless handoffs across future AI engineering sessions (Claude, ChatGPT, Gemini) and human software architects.

---

## 1. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Server Actions)
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS (Underground dark theme tokens)
- **Database**: PostgreSQL via Supabase (Relational schema, Constraints, RLS, Indexes)
- **Authentication**: Supabase Auth SSR with Cookie-based Next.js Middleware
- **Storage**: Supabase Storage bucket `posters` (direct-to-Storage uploads with signed URLs)
- **Validation**: Zod (Schema validation for forms & environment variables)
- **Digital Ticketing**: Unguessable codes (`SKY-YYYY-<22 URL-safe chars>`, 16 random bytes) with QR code generation via `qrcode`

---

## 2. Directory Architecture & Layer Responsibilities

```text
skydra/
├── app/                              # Next.js App Router (Pages, Layouts, API Route Handlers)
│   ├── (public)/                     # Public customer-facing routes
│   │   ├── page.tsx                  # Arena Homepage (Hero, Countdown, Featured Event, Showcases)
│   │   ├── events/
│   │   │   ├── page.tsx              # Events Catalog (Upcoming vs Past Tabs)
│   │   │   └── [slug]/page.tsx       # Dynamic Event Details (Poster, Venue, Battles from this event, Register Modal)
│   │   ├── battles/page.tsx          # Battles (YouTube videos), event filter, pagination
│   │   ├── tickets/
│   │   │   └── [ticketCode]/page.tsx # Standalone Digital Ticket Pass & QR Code Verification
│   │   ├── about/page.tsx            # League Origins, Philosophy, Leadership
│   │   ├── house-rules/page.tsx      # Venue Guidelines (reachable from registration + footer, not in main nav)
│   │   ├── contact/page.tsx          # Emcee Tryouts, Sponsors, Press Inquiries
│   │   └── privacy/page.tsx          # Attendee Data Privacy Policy
│   ├── admin/                        # Protected Organizer Portal
│   │   ├── layout.tsx                # Admin Sidebar & Shell Layout
│   │   ├── page.tsx                  # Dashboard Metrics & Recent Registrations
│   │   ├── login/page.tsx            # Admin Sign-In (Supabase Auth SSR)
│   │   ├── events/
│   │   │   ├── page.tsx              # Event Management Table, Archive & Registration Toggles
│   │   │   ├── create/page.tsx       # Create Event (poster upload from device)
│   │   │   └── edit/page.tsx         # Edit Event
│   │   ├── battles/                  # Battles list, create, edit (YouTube URL)
│   │   ├── registrations/page.tsx    # Attendee Roster, Search, Check-in, Delete & CSV Export
│   │   └── settings/page.tsx         # Global League Settings Editor
│   ├── api/                          # Next.js Server Route Handlers
│   │   ├── registrations/route.ts    # Public Registration Endpoint
│   │   └── admin/                    # Privileged Admin APIs
│   │       ├── events/               # Event CRUD, Archive & Status Toggles
│   │       ├── battles/              # Battle CRUD
│   │       ├── storage/poster-upload-url/  # Signed upload URL for posters (admin only)
│   │       └── registrations/        # Check-In, Delete & CSV Export
│   ├── globals.css                   # Tailwind Directives & Print Stylesheets
│   ├── layout.tsx                    # Public Navigation, Footer & Metadata
│   ├── not-found.tsx                 # Custom 404 Error Boundary
│   └── error.tsx                     # Global Application Error Boundary
├── components/                       # Atomic UI & Domain Components
│   ├── ui/                           # Base Design Tokens (Button, Badge, Input, Card, Modal, Container)
│   ├── layout/                       # Navbar, Footer
│   ├── battles/                      # BattleCard (YouTube thumbnail + badges)
│   ├── events/                       # EventCard, EventCountdown, RegistrationForm, TicketCard
│   └── admin/                        # AdminSidebar, EventForm, PosterUploader, BattleForm, row actions
├── lib/                              # Core Utility & Integration Layer
│   ├── env.ts                        # Zod Environment Variable Validator
│   ├── supabase/                     # Supabase Clients (browser, server, admin, middleware) + auth-guard
│   └── utils/                        # Formatters (PHP, Manila time), youtube, csv, ticket & QR, poster storage, image hosts
├── services/                         # Business Logic & Data Access Layer (Decoupled from UI)
│   ├── events.ts                     # Event Catalog, Status & CRUD Operations
│   ├── battles.ts                    # YouTube battles: public list/filter/pagination + admin CRUD
│   ├── registrations.ts              # Ticket Generation, Capacity Checks & CSV Export
│   └── admin.ts                      # Dashboard Aggregations & League Settings
├── types/                            # Canonical TypeScript Definitions
│   ├── database.ts                   # Supabase Database Schemas & Enums
│   ├── events.ts                     # Event models + zod schemas (battle models: types/battles.ts)
│   ├── registrations.ts              # Registration, Ticket & Attendee Models
│   └── admin.ts                      # Admin Metrics & Settings Schemas
├── supabase/
│   └── migrations/                   # PostgreSQL DDL Migrations, RLS Policies & Triggers
│       ├── 20261124_init_schema.sql  # Canonical Database Schema (already applied)
│       └── 20261125000001..05_*.sql  # v1.1: drop matchups, battles, registrations, RLS lock-down, poster bucket limits
```

---

## 3. Database Architecture (PostgreSQL / Supabase)

All database entities are fully normalized and documented in `supabase/migrations/20261124_init_schema.sql`.

### Core Tables & Relationships:
1. **`events`**:
   - Primary entity storing event title, slug, venue, schedule, ticket price, capacity, and lifecycle status (`draft`, `published`, `live`, `past`, `cancelled`).
   - Includes `registration_status` (`open`, `closed`, `paused`).
2. **`battles`** (replaces the removed `matchups` fight card):
   - YouTube battle videos: title, normalized `youtube_url`, `youtube_video_id`, `battle_type` (`tournament` / `non_tournament`), optional `event_id` (`ON DELETE SET NULL`), `battle_date`, `is_published`.
3. **`registrations`**:
   - `1:N` relationship with `events`.
   - Stores full name, Facebook profile, age, contact number (`phone_number`), barangay, city, emergency contact name + number, House Rules / Privacy consent flags (`CHECK (true)`), `consent_at`, and an unguessable `ticket_code`. No email, no stage name.
   - One non-cancelled registration per `(event_id, lower(full_name), phone_number)`.
   - Enforces `ON DELETE RESTRICT` on events so historical registration audits are never lost.
4. **`admin_profiles`**:
   - Links `1:1` with `auth.users(id)`.
   - Supports role-based access control (`superadmin`, `admin`, `coordinator`, `gatekeeper`).
5. **`league_settings`**:
   - JSONB configuration store for league contact, social links, and house rules.
6. **`media_assets`**:
   - Metadata registry for posters and flyers stored in Supabase Storage.

### Security (Row Level Security - RLS):
- Public users can only read `published`, `live`, or `past` events, and `battles` where `is_published = true`.
- **The public anon key has no access to `registrations`** (no SELECT, no INSERT). Registration, ticket lookup, admin list, check-in, delete and export all run server-side with the service-role client. Capacity is enforced by the service and by the database trigger `trigger_enforce_event_capacity`.
- The public ticket page `/tickets/[ticketCode]` shows only ticket ID, QR, attendee name, event info and status.
- Authenticated users listed in `admin_profiles` have full access. Every `/api/admin/*` route and `/admin/*` page re-verifies this server-side.
- Poster files: the `posters` bucket is publicly readable; only signed upload URLs (issued to admins) can write.

---

## 4. Setup & Local Development

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Run Database Migration
Execute in the Supabase SQL Editor, in this order:
1. `20261124_init_schema.sql`
2. `20261125000001_drop_matchups.sql`
3. `20261125000002_create_battles.sql`
4. `20261125000003_update_registrations_schema.sql` (deletes existing test registrations)
5. `20261125000004_secure_registrations_rls.sql`
6. `20261125000005_lock_poster_storage.sql`

Then create an admin: add a user in Supabase Auth and insert a row in `admin_profiles` with that user's id.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 5. Architectural Guide for Future AI Sessions

When extending this repository in subsequent AI prompts:
1. **Do NOT redesign the core architecture**: All routes, services, and domain models are already wired to production standards.
2. **Business logic lives in `services/`**: Keep Server Actions and Route Handlers thin. Always encapsulate domain logic inside `services/`.
3. **Database migrations**: When adding new fields (e.g. online payments), create new sequential migration files in `supabase/migrations/`. Never edit applied migrations.
4. **UI Styling**: Preserve the underground aesthetic defined in `tailwind.config.ts` using deep zinc backgrounds (`#09090b`), dark cards (`#121215`), and crimson/rose accents (`#e11d48`).
5. **Read `docs/PROJECT_GUIDE.md`** for the v1.1 decisions (battles replace matchups, poster upload flow, new registration fields, privacy rules, admin access model).
