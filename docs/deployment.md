# Deployment Guide

## Vercel Project
- **Project**: ZzpChat
- **Project ID**: `prj_gylszNCqG9LcURh1H7QBIrJO7Bja`
- **Repository**: `warleycoppens1/zzpchat-app`
- **Default Branch**: `main`

## Pipelines
- **Automatic deploy**: push to `main`
- **Manual trigger**: `npm run deploy:trigger` (runs the deploy hook below)
- **Deploy hook**: `https://api.vercel.com/v1/integrations/deploy/prj_gylszNCqG9LcURh1H7QBIrJO7Bja/4DCqtRR2ij`

```bash
# Force deploy via curl
curl -X GET "https://api.vercel.com/v1/integrations/deploy/prj_gylszNCqG9LcURh1H7QBIrJO7Bja/4DCqtRR2ij"
```

## Build Settings (`vercel.json`)
- Install: `npm install`
- Build: `npm run build`
- Output directory: `.next`
- Cron: `/api/cron/run-automations` executes every minute

`npm run build` already runs `npx prisma generate` before `next build`, so the Prisma client stays up to date.

## Environment Variables
- Define all secrets in Vercel → Project → Settings → Environment Variables
- Mirror them locally in `.env.local`
- Reference the list in `docs/architecture.md`

## Troubleshooting
1. **Build stuck on “Running build step…”**
   - Clear build cache in Vercel (Project → Settings → General → “Clear build cache”)
   - Ensure Prisma `postinstall` is not re-running during build (`npm run build` already covers it)
   - Run `npm run build` locally; check for TypeScript errors or hanging scripts.
2. **Old version served**
   - Force deploy via the hook above
   - Invalidate CDN via Vercel dashboard if assets are cached
3. **Environment mismatches**
   - Confirm `.env.local` vs. Vercel settings
   - Verify database connectivity (Prisma client will surface connection errors during build)

## Post-Deploy Checklist
- Smoke-check landing page + dashboard
- Validate authentication (email/password + Google OAuth)
- Trigger a sample AI chat request (`/api/ai/chat`)
- Upload a document and generate an invoice PDF
- Review Vercel logs for warnings
