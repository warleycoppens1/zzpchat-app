# ZzpChat Documentation Hub

## Quick Start
- Install dependencies: `npm install`
- Generate Prisma client: `npx prisma generate`
- Launch the dev server: `npm run dev`
- Run the test build (matches Vercel): `npm run build`

## Project Map
- `app/` – Next.js App Router pages (public pages + dashboard + API routes)
- `components/` – Reusable UI elements (shadcn-based primitives and custom widgets)
- `lib/` – Business logic, integrations, automation, Prisma client, shared helpers
- `prisma/` – Schema and migrations
- `public/` – Static assets (og image, favicons)
- `docs/` – Reference material (this folder)

## Document Index
- `architecture.md` – High-level system design, data flow, directory ownership
- `api.md` – Summary of core API surfaces exposed under `/api`
- `deployment.md` – Vercel deployment workflow and force-redeploy options
- `MIGRATION_NOTES.md` – Historical database changes and context
- `n8n-strategic-use-cases.md` – Automation scenarios and recommended flows
- `workflows/zzpchat-ai-assistant-workflow.json` – Export of the SimAI automation used in production

## Operational Notes
- Runtime directories such as `uploads/` are ignored by git; create them locally when running features that rely on file storage.
- Cron schedule (`/api/cron/run-automations`) is defined in `vercel.json` and runs every minute – disable it in development if unnecessary.
- Environment variables are documented in `architecture.md`; see Vercel project settings for production values.
