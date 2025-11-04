# Architecture Overview

## Stack
- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript everywhere (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui primitives
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth (Google OAuth + credentials) with session typing in `types/next-auth.d.ts`
- **AI**: OpenAI (chat + embeddings) orchestration in `lib/ai-agent.ts` and `lib/ai-tools/*`
- **Messaging**: WhatsApp automation via Twilio + Meta APIs (`lib/whatsapp*.ts`)
- **Payments**: Mollie client in `lib/mollie.ts`

## Application Flow
1. **Landing & Auth** – Public marketing pages live in `app/page.tsx`, `app/pricing`, `app/login`, `app/register`.
2. **Dashboard** – Authenticated routes under `app/dashboard/*`; `app/dashboard/layout.tsx` wires providers and navigation.
3. **API Routes** – Co-located under `app/api`. Key groups:
   - `/api/ai/*` – AI conversations, browser automation helpers
   - `/api/documents`, `/api/invoices`, `/api/quotes`, `/api/time-entries` – CRUD endpoints backing dashboard features
   - `/api/webhooks/*` – WhatsApp, Mollie, n8n entry points
   - `/api/cron/run-automations` – Scheduled automation engine trigger
4. **Automation** – `lib/automation-engine.ts` orchestrates background workflows, powered by SimAI via `workflows/zzpchat-ai-assistant-workflow.json`.
5. **Context & RAG** – `lib/rag/*` handles embedding, indexing, and retrieval for AI prompts.

## Directory Ownership
- `components/` contains shared UI blocks. Prefer composing them before adding new ad-hoc UI inside pages.
- `lib/` hosts server-side logic. Each submodule should export pure functions or service classes with clear responsibility. Add JSDoc comments when adding new methods.
- `app/api/*` should remain thin wrappers that validate input, call a `lib/` helper, and return typed responses.
- `workflows/` stores external automation definitions; keep JSON exports versioned here.

## Environment Variables
| Group | Variables |
| --- | --- |
| Core | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `APP_URL` |
| OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, optional Microsoft credentials |
| AI | `OPENAI_API_KEY`, feature-specific keys such as `SIMAI_API_KEY` |
| Messaging | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `TWILIO_*` |
| Payments | `MOLLIE_API_KEY`, `MOLLIE_WEBHOOK_SECRET` |
| Security | `ENCRYPTION_KEY` (32 chars, enforced in `lib/encryption.ts`) |

Populate the values in `.env.local` for local development; Vercel project settings contain production equivalents.

## Cron & Background Work
- Cron schedule is configured in `vercel.json` to hit `/api/cron/run-automations` every minute.
- Long-running tasks should enqueue external jobs or rely on SimAI; avoid heavy work directly inside API routes.
- Puppeteer usage lives under `lib/browser-automation/` and is only executed on demand via API routes.

## Future Contributions
- Use the directory map above to place new logic; prefer expanding existing modules over creating flat utility scripts.
- Annotate complex flows with inline comments or JSDoc – start by explaining intent, then tricky edge-cases.
- Keep Prisma schema changes documented in `docs/MIGRATION_NOTES.md` and accompany them with migrations.
