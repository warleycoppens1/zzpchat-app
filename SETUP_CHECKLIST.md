# ZzpChat Setup Checklist & To-Do's

Dit document bevat een complete checklist om ZzpChat volledig operationeel te krijgen. Werk deze lijst stap voor stap af.

## 📋 Inhoudsopgave

1. [Initial Setup](#initial-setup)
2. [Database Configuration](#database-configuration)
3. [Authentication Setup](#authentication-setup)
4. [AI & OpenAI Configuration](#ai--openai-configuration)
5. [WhatsApp Setup](#whatsapp-setup)
6. [Integration Setup](#integration-setup)
7. [n8n Workflow Setup](#n8n-workflow-setup)
8. [Testing & Verification](#testing--verification)
9. [Production Deployment](#production-deployment)
10. [Post-Deployment](#post-deployment)

---

## 🔧 Initial Setup

### Requirements Check

- [ ] **Node.js 18+** geïnstalleerd
  ```bash
  node --version  # Should be >= 18.0.0
  ```

- [ ] **npm of yarn** geïnstalleerd
  ```bash
  npm --version
  ```

- [ ] **Git** geïnstalleerd (voor versiebeheer)
  ```bash
  git --version
  ```

### Project Setup

- [ ] **Repository gekloond**
  ```bash
  git clone <repository-url>
  cd ZzpChat
  ```

- [ ] **Dependencies geïnstalleerd**
  ```bash
  npm install
  ```

- [ ] **Environment file aangemaakt**
  ```bash
  cp env.example .env.local
  ```

---

## 🗄️ Database Configuration

### PostgreSQL Database

- [ ] **PostgreSQL database aangemaakt**
  - Optie 1: Lokale PostgreSQL installatie
  - Optie 2: Supabase (gratis tier beschikbaar)
  - Optie 3: Railway, PlanetScale, of andere cloud provider

- [ ] **DATABASE_URL geconfigureerd** in `.env.local`
  ```env
  DATABASE_URL="postgresql://user:password@host:port/database"
  ```
  - Voor Supabase: Vind in Project Settings → Database → Connection string
  - Voor lokale: `postgresql://postgres:password@localhost:5432/zzpchat`

- [ ] **Database schema gepusht**
  ```bash
  npx prisma generate
  npx prisma db push
  ```

- [ ] **Database geseed (optioneel, voor test data)**
  ```bash
  npm run db:seed
  ```

- [ ] **Database connectie getest**
  - Check console output na `npm run dev`
  - Geen database errors in logs

---

## 🔐 Authentication Setup

### NextAuth.js Configuration

- [ ] **NEXTAUTH_SECRET gegenereerd**
  - Gebruik: `openssl rand -base64 32`
  - Of online generator: https://generate-secret.vercel.app/32
  - **Minimaal 32 karakters!**
  ```env
  NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters"
  ```

- [ ] **NEXTAUTH_URL geconfigureerd**
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
  ```env
  NEXTAUTH_URL="http://localhost:3000"
  ```

### Google OAuth (Optional, maar aanbevolen)

- [ ] **Google Cloud Project aangemaakt**
  - Ga naar https://console.cloud.google.com
  - Maak nieuw project aan

- [ ] **OAuth 2.0 credentials aangemaakt**
  - Ga naar "APIs & Services" → "Credentials"
  - Klik "Create Credentials" → "OAuth client ID"
  - Application type: "Web application"
  - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

- [ ] **Google Client ID & Secret gekopieerd**
  ```env
  GOOGLE_CLIENT_ID="your-google-client-id"
  GOOGLE_CLIENT_SECRET="your-google-client-secret"
  ```

- [ ] **Google OAuth getest**
  - Navigeer naar `/login`
  - Test "Sign in with Google" button

### Test User Setup

- [ ] **Test user aangemaakt**
  - Navigeer naar `/api/auth/setup-test-user`
  - Of gebruik seed script: `npm run db:seed`
  - Default credentials: `test@zzpchat.nl` / `test123`

---

## 🤖 AI & OpenAI Configuration

### OpenAI Setup

- [ ] **OpenAI account aangemaakt**
  - Ga naar https://platform.openai.com
  - Maak account aan

- [ ] **API key gegenereerd**
  - Ga naar https://platform.openai.com/api-keys
  - Klik "Create new secret key"
  - Kopieer key (wordt slechts 1x getoond!)

- [ ] **OPENAI_API_KEY geconfigureerd**
  ```env
  OPENAI_API_KEY="sk-proj-..."
  ```

- [ ] **API key getest**
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

- [ ] **AI Chat functionaliteit getest**
  - Navigeer naar `/dashboard/ai`
  - Stel een vraag aan de AI
  - Check of response wordt gegenereerd

### AI Features Verification

- [ ] **Intent analysis werkt**
  - Test verschillende vragen in chat
  - Check console voor intent detection

- [ ] **File processing werkt**
  - Upload een bestand in AI chat
  - Stel vraag over bestand
  - Check of AI bestand inhoud kan gebruiken

- [ ] **Integration tools werken**
  - Check `/dashboard/integrations` voor beschikbare integraties
  - Test een integratie tool (bijv. Gmail search)

---

## 📱 WhatsApp Setup

### Keuze: Meta WhatsApp OF Twilio WhatsApp

Kies één van de twee providers:

### Optie A: Meta WhatsApp Business API

- [ ] **Meta Business Account aangemaakt**
  - Ga naar https://business.facebook.com
  - Maak Business Account aan

- [ ] **WhatsApp Business API access verkregen**
  - Ga naar Meta Business Manager
  - Navigeer naar WhatsApp Accounts
  - Start verificatie proces

- [ ] **WhatsApp Access Token verkregen**
  - Ga naar https://developers.facebook.com/apps
  - Maak app aan of gebruik bestaande
  - Ga naar WhatsApp → API Setup
  - Kopieer Access Token

- [ ] **Phone Number ID verkregen**
  - Inzelfde scherm als Access Token
  - Kopieer Phone Number ID

- [ ] **Webhook Verify Token gegenereerd**
  - Gebruik een random string: `openssl rand -hex 16`
  - Onthoud deze, gebruik voor webhook setup

- [ ] **Environment variables geconfigureerd**
  ```env
  WHATSAPP_PROVIDER="meta"
  WHATSAPP_ACCESS_TOKEN="your-access-token"
  WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
  WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-verify-token"
  ```

- [ ] **Webhook geconfigureerd in Meta**
  - Ga naar App Dashboard → WhatsApp → Configuration
  - Webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
  - Verify Token: gebruik zelfde token als in env
  - Subscribe to: `messages`, `message_status`

- [ ] **WhatsApp webhook getest**
  ```bash
  # Test webhook verification
  curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
  ```

### Optie B: Twilio WhatsApp API

- [ ] **Twilio account aangemaakt**
  - Ga naar https://www.twilio.com/try-twilio
  - Maak account aan

- [ ] **Account SID en Auth Token gekopieerd**
  - Ga naar Twilio Console → Account → Settings
  - Kopieer Account SID en Auth Token

- [ ] **WhatsApp Sandbox geactiveerd (voor development)**
  - Ga naar Messaging → Try it out → Send a WhatsApp Message
  - Volg instructies om telefoonnummer te verifiëren

- [ ] **WhatsApp Business API access (voor production)**
  - Zie `TWILIO_SETUP.md` voor volledige instructies
  - Request WhatsApp Sender via Twilio Console

- [ ] **Environment variables geconfigureerd**
  ```env
  WHATSAPP_PROVIDER="twilio"
  TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  TWILIO_AUTH_TOKEN="your_auth_token"
  TWILIO_WHATSAPP_FROM_NUMBER="whatsapp:+1234567890"
  TWILIO_VALIDATE_WEBHOOK="true"
  ```

- [ ] **Webhook geconfigureerd in Twilio**
  - Ga naar Twilio Console → Messaging → Settings → WhatsApp
  - Configure "When a message comes in" webhook:
    - URL: `https://your-domain.com/api/webhooks/twilio`
    - Method: `HTTP POST`

- [ ] **Twilio webhook getest**
  - Verstuur test bericht naar Twilio WhatsApp nummer
  - Check logs voor webhook ontvangst

### WhatsApp Functionaliteit Test

- [ ] **Bericht ontvangen werkt**
  - Stuur WhatsApp bericht naar geconfigureerd nummer
  - Check logs voor webhook ontvangst
  - Check of acknowledgment wordt verstuurd

- [ ] **Bericht versturen werkt**
  - Test via code of API
  ```typescript
  import { unifiedWhatsAppService } from '@/lib/whatsapp-unified'
  await unifiedWhatsAppService.sendMessage('+31612345678', 'Test bericht')
  ```

- [ ] **Audio transcription werkt (indien gebruikt)**
  - Stuur voice message via WhatsApp
  - Check of transcriptie wordt gegenereerd

---

## 🔗 Integration Setup

### Google Integraties

#### Gmail

- [ ] **Gmail OAuth geconfigureerd**
  - Google Cloud Console → APIs & Services → Credentials
  - Zorg dat Gmail API is enabled
  - OAuth consent screen is geconfigureerd

- [ ] **Gmail integratie getest**
  - Navigeer naar `/dashboard/integrations`
  - Klik "Verbinden" bij Gmail
  - Volg OAuth flow
  - Check of status "Verbonden" wordt

- [ ] **Gmail functionaliteit getest**
  - Test Gmail search via AI chat:
    - "Zoek e-mails van klant@example.com"
  - Check of resultaten worden getoond

#### Google Drive

- [ ] **Google Drive API enabled**
  - Google Cloud Console → APIs & Services → Library
  - Zoek "Google Drive API"
  - Klik "Enable"

- [ ] **Google Drive integratie getest**
  - Verbind Google Drive via `/dashboard/integrations`
  - Test file upload via AI:
    - "Upload dit bestand naar Google Drive"

#### Google Calendar

- [ ] **Google Calendar API enabled**
  - Google Cloud Console → APIs & Services → Library
  - Enable "Google Calendar API"

- [ ] **Google Calendar integratie getest**
  - Verbind Google Calendar
  - Test via AI:
    - "Wat staat er morgen op mijn agenda?"

### Microsoft Integraties

#### Outlook Mail

- [ ] **Microsoft Azure App geregistreerd**
  - Ga naar https://portal.azure.com
  - Azure Active Directory → App registrations
  - Nieuwe registratie aanmaken

- [ ] **Microsoft Client ID & Secret aangemaakt**
  - In Azure App → Certificates & secrets
  - Nieuwe client secret aanmaken
  - Kopieer Client ID en Secret

- [ ] **Microsoft permissions geconfigureerd**
  - API permissions → Add permissions
  - Microsoft Graph → Delegated permissions
  - Toevoegen: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`

- [ ] **Environment variables geconfigureerd**
  ```env
  MICROSOFT_CLIENT_ID="your-microsoft-client-id"
  MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
  ```

- [ ] **Outlook integratie getest**
  - Verbind via `/dashboard/integrations`
  - Test e-mail search via AI

#### Outlook Calendar

- [ ] **Calendar permissions geconfigureerd**
  - Microsoft Graph permissions:
    - `Calendars.Read`, `Calendars.ReadWrite`

- [ ] **Outlook Calendar integratie getest**
  - Verbind Outlook Calendar
  - Test agenda functionaliteit via AI

### Encryption Setup

- [ ] **ENCRYPTION_KEY gegenereerd**
  ```bash
  openssl rand -base64 32
  ```
  ```env
  ENCRYPTION_KEY="your-32-character-encryption-key"
  ```

- [ ] **Encryption getest**
  - Verbind een integratie
  - Check database of tokens encrypted zijn opgeslagen
  - Check of tokens correct kunnen worden gedecrypteerd

---

## 🔄 n8n Workflow Setup

### n8n Installation

- [ ] **n8n geïnstalleerd**
  - Optie 1: n8n Cloud (https://n8n.io/cloud)
  - Optie 2: Self-hosted n8n
  - Optie 3: Docker deployment

- [ ] **n8n webhook URL bekend**
  ```env
  N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
  N8N_API_KEY="your-n8n-api-key"  # Optional
  ```

### Service Account Setup

- [ ] **Service Account aangemaakt**
  - Navigeer naar `/dashboard/settings` (of via API)
  - Of gebruik API:
  ```bash
  curl -X POST http://localhost:3000/api/service-accounts \
    -H "Content-Type: application/json" \
    -d '{"name": "n8n-production", "userId": null}'
  ```

- [ ] **API Key opgeslagen**
  - Kopieer API key uit response
  - Bewaar veilig (wordt slechts 1x getoond)
  - Configureer in n8n workflow

- [ ] **Service Account permissions geconfigureerd**
  - Update service account met benodigde permissions
  - Zie `lib/service-auth-middleware.ts` voor beschikbare permissions

### n8n Workflow Import

- [ ] **Workflow JSON geïmporteerd**
  - Open n8n
  - Ga naar Workflows
  - Klik "Import from File"
  - Selecteer `workflows/zzpchat-ai-assistant-workflow.json`

- [ ] **Webhook endpoint geconfigureerd**
  - In n8n workflow: Webhook node
  - Method: POST
  - Path: `/webhook/zzpchat-ai-assistant`
  - Activate workflow

- [ ] **API Authentication geconfigureerd**
  - In n8n workflow: HTTP Request node naar ZzpChat
  - Headers:
    - `X-API-Key: your-service-account-api-key`
    - `Content-Type: application/json`

- [ ] **Workflow actions getest**
  - Test `create_invoice` action
  - Test `create_quote` action
  - Test `ai_intent` action
  - Check of responses correct zijn

### Workflow Endpoints Verification

- [ ] **n8n webhook endpoint werkt**
  ```bash
  curl -X POST http://localhost:3000/api/webhooks/n8n \
    -H "X-API-Key: your-api-key" \
    -H "Content-Type: application/json" \
    -d '{"action": "context_search", "parameters": {"query": "test"}}'
  ```

- [ ] **Service account authenticatie werkt**
  - Test endpoint: `/api/test/n8n`
  - Check of authenticatie succesvol is

---

## ✅ Testing & Verification

### Core Functionality

- [ ] **Application start zonder errors**
  ```bash
  npm run dev
  ```
  - Check console voor errors
  - Check browser console voor errors

- [ ] **Login werkt**
  - Test credentials login
  - Test Google OAuth login
  - Test registratie

- [ ] **Dashboard laadt**
  - Navigeer naar `/dashboard`
  - Check of alle widgets zichtbaar zijn
  - Check of data wordt geladen

### Business Logic

- [ ] **Klantenbeheer werkt**
  - Maak nieuwe klant aan
  - Update klant gegevens
  - Verwijder klant

- [ ] **Facturen werken**
  - Maak factuur aan
  - Preview factuur
  - Export factuur (indien geïmplementeerd)

- [ ] **Offertes werken**
  - Maak offerte aan
  - Preview offerte
  - Convert offerte naar factuur (indien geïmplementeerd)

- [ ] **Urenregistratie werkt**
  - Voeg time entry toe
  - Bekijk time entries
  - Filter time entries

### AI Chat

- [ ] **Basic chat werkt**
  - Stel simpele vraag: "Hoe gaat het?"
  - Check of response wordt gegenereerd

- [ ] **Intent detection werkt**
  - Test: "Maak een factuur voor €500"
  - Check of intent correct wordt gedetecteerd

- [ ] **File upload werkt**
  - Upload bestand in chat
  - Stel vraag over bestand
  - Check of AI bestand kan gebruiken

- [ ] **Integration tools werken**
  - Test Gmail search
  - Test Google Drive upload
  - Test Calendar events

### Webhooks

- [ ] **WhatsApp webhook werkt**
  - Verstuur test bericht
  - Check logs voor verwerking
  - Check of response wordt verstuurd

- [ ] **n8n webhook werkt**
  - Trigger workflow vanuit n8n
  - Check logs voor request
  - Check of action wordt uitgevoerd

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] **Production database aangemaakt**
  - PostgreSQL database op cloud provider
  - Connection string opgehaald

- [ ] **Production environment variables geconfigureerd**
  - Alle required variables ingesteld
  - Geen development/test credentials
  - Secrets veilig opgeslagen

- [ ] **Domain name geconfigureerd**
  - Domain aangekocht
  - DNS records geconfigureerd
  - SSL certificate geregeld (automatisch via Vercel)

### Vercel Deployment

- [ ] **Vercel account aangemaakt**
  - Ga naar https://vercel.com
  - Maak account aan

- [ ] **Project geconnecteerd aan Vercel**
  ```bash
  npm i -g vercel
  vercel login
  vercel
  ```

- [ ] **Environment variables ingesteld in Vercel**
  - Vercel Dashboard → Project → Settings → Environment Variables
  - Voeg alle variables toe uit `.env.local`
  - Zorg dat Production, Preview, en Development allebei geconfigureerd zijn

- [ ] **Database schema gepusht naar production**
  ```bash
  DATABASE_URL="production-url" npx prisma db push
  ```

- [ ] **Build succesvol**
  ```bash
  npm run build
  ```
  - Geen build errors
  - Alle TypeScript types correct

- [ ] **Deploy naar production**
  ```bash
  vercel --prod
  ```

### Post-Deployment Verification

- [ ] **Website bereikbaar**
  - Navigeer naar production URL
  - Check of site laadt zonder errors

- [ ] **HTTPS werkt**
  - Check SSL certificate
  - Check of HTTP redirect naar HTTPS

- [ ] **Login werkt in production**
  - Test credentials login
  - Test OAuth login

---

## 🔧 Post-Deployment

### Webhook Configuration

- [ ] **WhatsApp webhook geupdate**
  - Meta: Update webhook URL naar production
  - Twilio: Update webhook URL naar production
  - Test webhook verification

- [ ] **Mollie webhook geconfigureerd** (indien gebruikt)
  - Mollie Dashboard → Webhooks
  - URL: `https://your-domain.com/api/webhooks/mollie`
  - Test webhook

- [ ] **n8n workflows geupdate**
  - Update webhook URLs naar production
  - Update API endpoints naar production
  - Test workflows

### Monitoring Setup

- [ ] **Error logging geconfigureerd**
  - Vercel logging enabled
  - Of externe service (Sentry, LogRocket, etc.)

- [ ] **Analytics geconfigureerd** (optioneel)
  - Google Analytics
  - Of andere analytics service

- [ ] **Uptime monitoring** (optioneel)
  - UptimeRobot, Pingdom, of vergelijkbaar
  - Monitor main endpoints

### Security Checklist

- [ ] **Environment variables veilig**
  - Geen secrets in code
  - Geen secrets in git
  - Alle secrets in Vercel environment variables

- [ ] **Database beveiligd**
  - Database credentials veilig opgeslagen
  - Database niet publiekelijk toegankelijk
  - Firewall rules geconfigureerd

- [ ] **API rate limiting** (indien geïmplementeerd)
  - Rate limits geconfigureerd
  - Test rate limiting

- [ ] **CORS geconfigureerd**
  - Alleen toegestane origins
  - Production domain in CORS whitelist

---

## 📝 Documentation

### Developer Documentation

- [ ] **README.md up-to-date**
  - Setup instructies
  - Development guide
  - Deployment guide

- [ ] **API documentation up-to-date**
  - Check `API_DOCUMENTATION.md`
  - Alle endpoints gedocumenteerd

### User Documentation

- [ ] **User guide beschikbaar** (optioneel)
  - Feature uitleg
  - How-to guides
  - FAQ

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

- Check `DATABASE_URL` format
- Check firewall rules
- Check database credentials

#### OAuth Issues

- Check redirect URIs
- Check OAuth client credentials
- Check OAuth consent screen status

#### WhatsApp Issues

- Check webhook URL accessibility
- Check webhook verification token
- Check provider credentials

#### Build Errors

- Check TypeScript errors: `npm run build`
- Check missing dependencies: `npm install`
- Check environment variables

---

## ✅ Final Checklist

- [ ] Alle environment variables geconfigureerd
- [ ] Database schema gepusht
- [ ] Alle integraties getest
- [ ] AI chat werkt
- [ ] WhatsApp webhook werkt
- [ ] n8n workflows werken
- [ ] Production deployment succesvol
- [ ] Monitoring geconfigureerd
- [ ] Security checklist afgevinkt
- [ ] Documentation up-to-date

---

## 📞 Support & Resources

- **Documentation**: Check `docs/` folder
- **Setup Guides**: 
  - `TWILIO_SETUP.md` - Twilio WhatsApp setup
  - `docs/n8n-strategic-use-cases.md` - n8n workflows
  - `docs/MIGRATION_NOTES.md` - Migration guide
- **Issues**: Open GitHub issue
- **Email**: support@zzpchat.nl

---

**Laatste update**: 2025-01-29

**Status**: Alle core features geïmplementeerd, klaar voor testing en deployment

