AI Context

Project:
SKYDRA Official Website

Current Phase:
MVP v1.1 (battles, poster upload, registration + privacy lock-down). See docs/PROJECT_GUIDE.md.

Current Stack:
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Supabase (Postgres, Auth, Storage)
- Vercel

Current Progress:
- Repository created
- Planning completed
- Backbone generated (events, registrations, tickets, admin portal)
- v1.1: matchups (fight card) removed, YouTube Battles added, poster upload from device,
  new registration fields, public access to registrations revoked, admin API routes guarded

Pending (needs the owner to apply in Supabase, in order):
- supabase/migrations/20261125000001 ... 20261125000005

Next Goal:
Apply migrations, create the first admin, test on localhost:3000, then deploy to Vercel.

Notes:
This file is updated after every major milestone so any AI can continue the project.
Do not edit applied migrations; add new ones.
