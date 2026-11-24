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
- **Storage**: Supabase Storage Buckets (`posters`, `flyers`)
- **Validation**: Zod (Schema validation for forms & environment variables)
- **Digital Ticketing**: High-entropy cryptographically generated codes (`SKY-YYYY-XXXXXX`) with high-res QR code generation via `qrcode`

---

## 2. Directory Architecture & Layer Responsibilities

```text
skydra/
├── app/                              # Next.js App Router (Pages, Layouts, API Route Handlers)
│   ├── (public)/                     # Public customer-facing routes
│   │   ├── page.tsx                  # Arena Homepage (Hero, Countdown, Featured Event, Showcases)
│   │   ├── events/
│   │   │   ├── page.tsx              # Events Catalog (Upcoming vs Past Tabs)
│   │   │   └── [slug]/page.tsx       # Dynamic Event Details (Poster, Venue, Fight Card, Register Modal)
│   │   ├── tickets/
│   │   │   └── [ticketCode]/page.tsx # Standalone Digital Ticket Pass & QR Code Verification
│   │   ├── about/page.tsx            # League Origins, Philosophy, Leadership
│   │   ├── house-rules/page.tsx      # Venue Guidelines & Pit Etiquette
│   │   ├── contact/page.tsx          # Emcee Tryouts, Sponsors, Press Inquiries
│   │   └── privacy/page.tsx          # Attendee Data Privacy Policy
│   ├── admin/                        # Protected Organizer Portal
│   │   ├── layout.tsx                # Admin Sidebar & Shell Layout
│   │   ├── page.tsx                  # Dashboard Metrics & Recent Registrations
│   │   ├── login/page.tsx            # Admin Sign-In (Supabase Auth SSR)
│   │   ├── events/
│   │   │   ├── page.tsx              # Event Management Table & Registration Toggles
│   │   │   ├── create/page.tsx       # Create Event Form
│   │   │   └── edit/page.tsx         # Edit Event & Fight Card Matchup Manager
│   │   ├── registrations/page.tsx    # Attendee Roster, Search & CSV Export
│   │   └── settings/page.tsx         # Global League Settings Editor
│   ├── api/                          # Next.js Server Route Handlers
│   │   ├── registrations/route.ts    # Public Registration Endpoint
│   │   └── admin/                    # Privileged Admin APIs
│   │       ├── events/               # Event CRUD & Status Toggles
│   │       ├── matchups/             # Matchup Creation & Deletion
│   │       └── registrations/        # Gate Check-In & CSV Export Stream
│   ├── globals.css                   # Tailwind Directives & Print Stylesheets
│   ├── layout.tsx                    # Public Navigation, Footer & Metadata
│   ├── not-found.tsx                 # Custom 404 Error Boundary
│   └── error.tsx                     # Global Application Error Boundary
├── components/                       # Atomic UI & Domain Components
│   ├── ui/                           # Base Design Tokens (Button, Badge, Input, Card, Modal, Container)
│   ├── layout/                       # Navbar, Footer
│   ├── events/                       # EventCard, EventCountdown, BattleCard, BattleList, TicketCard
│   └── admin/                        # AdminSidebar, AdminHeader, MatchupManager, EventRowActions
├── lib/                              # Core Utility & Integration Layer
│   ├── env.ts                        # Zod Environment Variable Validator
│   ├── supabase/                     # Supabase Clients (browser, server, admin, middleware)
│   └── utils/                        # Formatters (PHP Currency, Manila Timezone), Ticket & QR generators
├── services/                         # Business Logic & Data Access Layer (Decoupled from UI)
│   ├── events.ts                     # Event Catalog, Status & CRUD Operations
│   ├── matchups.ts                   # Fight Card Sequencing & Winner Recording
│   ├── registrations.ts              # Ticket Generation, Capacity Checks & CSV Export
│   └── admin.ts                      # Dashboard Aggregations & League Settings
├── types/                            # Canonical TypeScript Definitions
│   ├── database.ts                   # Supabase Database Schemas & Enums
│   ├── events.ts                     # Event & Matchup Models
│   ├── registrations.ts              # Registration, Ticket & Attendee Models
│   └── admin.ts                      # Admin Metrics & Settings Schemas
├── supabase/
│   └── migrations/                   # PostgreSQL DDL Migrations, RLS Policies & Triggers
│       └── 20261124_init_schema.sql  # Canonical Database Schema
```

---

## 3. Database Architecture (PostgreSQL / Supabase)

All database entities are fully normalized and documented in `supabase/migrations/20261124_init_schema.sql`.

### Core Tables & Relationships:
1. **`events`**:
   - Primary entity storing event title, slug, venue, schedule, ticket price, capacity, and lifecycle status (`draft`, `published`, `live`, `past`, `cancelled`).
   - Includes `registration_status` (`open`, `closed`, `paused`).
2. **`matchups`**:
   - `1:N` relationship with `events`.
   - Records Battler 1 vs Battler 2, division (`Main Event`, `Co-Main`, `Underground`), rounds, fight card sequence (`order_index`), and declared winner.
3. **`registrations`**:
   - `1:N` relationship with `events`.
   - Stores attendee full name, stage name (alias), email, phone, and unique `ticket_code`.
   - Enforces unique email per active event to prevent duplicate bookings.
   - Enforces `ON DELETE RESTRICT` on events so historical registration audits are never lost.
4. **`admin_profiles`**:
   - Links `1:1` with `auth.users(id)`.
   - Supports role-based access control (`superadmin`, `admin`, `coordinator`, `gatekeeper`).
5. **`league_settings`**:
   - JSONB configuration store for league contact, social links, and house rules.
6. **`media_assets`**:
   - Metadata registry for posters and flyers stored in Supabase Storage.

### Security (Row Level Security - RLS):
- Public users can only read `published`, `live`, or `past` events and their matchups.
- Public users can insert registrations only if the event registration is `open` and capacity is not exceeded (enforced both by API and database trigger `trigger_enforce_event_capacity`).
- Attendees can view their digital ticket by exact ticket code lookup.
- Authenticated admin users with profiles have full read/write access to all tables.

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
Execute `supabase/migrations/20261124_init_schema.sql` in your Supabase SQL Editor.

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
3. **Database migrations**: When adding new fields (e.g. online payments, video embeds), create sequential migration files in `supabase/migrations/`.
4. **UI Styling**: Preserve the underground aesthetic defined in `tailwind.config.ts` using deep zinc backgrounds (`#09090b`), dark cards (`#121215`), and crimson/rose accents (`#e11d48`).
