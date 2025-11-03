# Deployment Guide

This document contains deployment information and shortcuts for ZzpChat.

## Vercel Deployment

### Project Details
- **Project**: ZzpChat
- **Vercel Project ID**: `prj_gylszNCqG9LcURh1H7QBIrJO7Bja`
- **Repository**: `warleycoppens1/zzpchat-app`
- **Branch**: `main`

### Manual Deployment

To force a deployment via the Vercel API:

```bash
curl -X GET "https://api.vercel.com/v1/integrations/deploy/prj_gylszNCqG9LcURh1H7QBIrJO7Bja/4DCqtRR2ij"
```

Or visit directly:
https://api.vercel.com/v1/integrations/deploy/prj_gylszNCqG9LcURh1H7QBIrJO7Bja/4DCqtRR2ij

### Automatic Deployment

Deployments trigger automatically when pushing to the `main` branch.

### Force Redeploy via Git

If automatic deployment doesn't trigger:

1. **Create a trigger commit:**
   ```bash
   echo "# Force redeploy - $(date)" >> vercel.json
   git add vercel.json
   git commit -m "chore: force redeploy"
   git push origin main
   ```

2. **Or use the deployment API link above**

### Environment Variables

All environment variables are configured in Vercel project settings:
- Production environment variables
- Preview environment variables
- Development environment variables

See `.env.example` for required variables.

### Build Configuration

Build settings are configured in `vercel.json`:
- **Build Command**: `npx prisma generate && npm run build`
- **Install Command**: `npm install && npx prisma generate`
- **Output Directory**: `.next`
- **Framework**: Next.js

### Troubleshooting

**Deployment stuck or failed:**
1. Check Vercel dashboard for build logs
2. Verify all environment variables are set
3. Check database connectivity
4. Review build logs for errors

**Old version showing after deployment:**
1. Clear browser cache (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
2. Wait 1-2 minutes for CDN propagation
3. Force redeploy using API link above

### Post-Deployment

After successful deployment:
1. Verify site loads correctly
2. Test authentication flow
3. Check API endpoints
4. Verify database connectivity
5. Test WhatsApp integration
6. Monitor error logs

### URLs

- **Production**: [Check Vercel dashboard]
- **Preview**: [Auto-generated for PRs]
- **Local**: http://localhost:3000

