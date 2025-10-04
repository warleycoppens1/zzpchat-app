# ZzpChat - Comprehensive Project Overview

**Versie**: 2.0.0  
**Laatste update**: 2 januari 2025  
**Status**: Actief in ontwikkeling - Epic 1 focus

## 📋 Project Status & Cleanup

Volgens de cleanup uitgevoerd op 29 september 2025 [[memory:9451978]]:

### ✅ Verwijderde Epic 2 Components:
- Epic 2 stories (2.1-2.6)
- `mobile/` folder
- `sdk/` folder
- `app/api/teams/`
- `app/api/analytics/`
- `app/api/mobile/`
- `app/api/v1/`
- `app/developer/`
- Team gerelateerde dashboard pages
- Epic 2 services

### 🎯 Huidige Focus - Epic 1:
- WhatsApp bot integratie
- Voice memos processing
- AI assistant functionaliteit
- Google integraties (Gmail, Calendar, Drive)
- Subscription management
- Web dashboard
- Business advice module
- Performance monitoring

---

## 🏗️ Architectuur Overzicht

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **Payments**: Mollie API (iDEAL, SEPA, Credit Card)
- **AI**: OpenAI GPT-4, OpenAI Whisper (voice transcription)
- **Automation**: n8n workflows
- **Deployment**: Vercel
- **UI Components**: Radix UI, Lucide React icons

### Database Schema (Prisma)
```prisma
- User (subscription tiers, OAuth accounts)
- Client (customer management)
- Invoice (factuur beheer met line items)
- Quote (offerte systeem)
- TimeEntry (urenregistratie)
- Integration (OAuth integraties)
- AI_Conversation (WhatsApp AI gesprekken)
- Account/Session (NextAuth.js)
```

---

## 🌐 Application URLs & Routes

### Public Pages
- `/` - Landing page (redirects to `/dashboard` if authenticated)
- `/login` - Login pagina (NextAuth.js)
- `/register` - Registratie pagina
- `/pricing` - Pricing pagina

### Dashboard Pages (Protected)
- `/dashboard` - Hoofd dashboard met statistieken
- `/dashboard/ai` - AI assistant interface
- `/dashboard/contacts` - Klantenbeheer
- `/dashboard/invoices` - Factuur beheer
- `/dashboard/quotes` - Offerte beheer
- `/dashboard/time-entries` - Urenregistratie
- `/dashboard/integrations` - Integratie beheer
- `/dashboard/settings` - Gebruikersinstellingen
- `/dashboard/whatsapp-setup` - WhatsApp configuratie

### API Routes
```
Authentication:
├── /api/auth/[...nextauth] - NextAuth.js endpoints
├── /api/auth/register - Gebruiker registratie
└── /api/auth/setup-test-user - Test gebruiker setup

Core Business Logic:
├── /api/clients - Klant CRUD operaties
├── /api/contacts - Contact CRUD operaties  
├── /api/invoices - Factuur CRUD operaties
├── /api/offers - Offerte CRUD operaties
├── /api/quotes - Quote CRUD operaties
├── /api/time-entries - Urenregistratie CRUD

Dashboard & Analytics:
├── /api/dashboard/stats - Dashboard statistieken

AI & Context:
├── /api/conversations - AI gesprek beheer
├── /api/context/search - Context zoeken voor RAG

Draft Management:
├── /api/drafts/pending - Pending drafts ophalen
├── /api/drafts/store - Draft opslaan
└── /api/drafts/update - Draft bijwerken

Utility:
├── /api/users/resolve-by-phone - Gebruiker zoeken op telefoon

Webhooks:
├── /api/webhooks/whatsapp - WhatsApp webhook
├── /api/webhooks/mollie - Mollie payment webhook
└── /api/webhooks/n8n - n8n automation webhook
```

---

## 🔑 Environment Variables & Configuration

### Database
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Authentication
```env
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="32+ character random string"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### AI & OpenAI
```env
OPENAI_API_KEY="sk-..."
```

### WhatsApp Business API
```env
WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-webhook-verify-token"
```

### Payment Processing (Mollie)
```env
MOLLIE_API_KEY="test_... or live_..."
MOLLIE_WEBHOOK_SECRET="your-mollie-webhook-secret"
```

### Microsoft Integration (Optional)
```env
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

### Security & Encryption
```env
ENCRYPTION_KEY="32-character-encryption-key"
```

### Automation (n8n)
```env
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
N8N_API_KEY="your-n8n-api-key"
```

### Application Settings
```env
NODE_ENV="production"
APP_URL="https://your-domain.com"
```

---

## 🤖 n8n Workflow Integration

### Grok Improved Workflow
**Bestand**: `/n8n-workflows/grok-improved-workflow.json`

#### Workflow Flow:
```
WhatsApp → Parse → Resolve User → [Error/Check Pending] → [Draft Feedback/New Message] → [Voice/Text] → Intent → Complexity → [Direct/RAG] → Feedback → Store Draft
```

#### Key Features:
- **Stateful Feedback System**: Pending drafts check, draft feedback loop
- **Audio Processing**: Metadata first, binary download, transcription
- **Error Handling**: User not found, graceful fallbacks
- **Draft Management**: Draft storage, status tracking, conversation history

#### API Integration Points:
- `POST /api/users/resolve-by-phone` - Gebruiker resolutie
- `POST /api/drafts/pending` - Pending drafts check
- `POST /api/drafts/update` - Draft updates
- `POST /api/drafts/store` - Draft opslag
- `POST /api/context/search` - Context zoeken

---

## 📊 Functionaliteiten Breakdown

### 1. 🤖 AI Assistant & WhatsApp Integration
**Status**: ✅ Actief
**Features**:
- Voice memo processing (OpenAI Whisper)
- Text message processing
- Intent detection en complexity analysis
- RAG (Retrieval Augmented Generation) voor context
- Draft management met feedback loop
- Stateful conversation handling

**API Endpoints**:
- `/api/conversations` - Gesprek beheer
- `/api/context/search` - Context zoeken
- `/api/drafts/*` - Draft management

### 2. 💼 Business Management
**Status**: ✅ Volledig geïmplementeerd

#### Client Management
- CRUD operaties voor klanten
- Tags en categorisering
- Relatie tracking (facturen, offertes, uren)

#### Invoice System
- Automatische nummering
- Line items support
- Status tracking (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- Mollie payment integration

#### Quote/Offer System
- Professional offerte generatie
- Validity tracking
- Status management (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)

#### Time Tracking
- Project-based urenregistratie
- Client association
- Invoice linking

### 3. 💳 Payment Integration (Mollie)
**Status**: ✅ Geïmplementeerd
**Features**:
- iDEAL, SEPA, Credit Card support
- Webhook handling voor payment updates
- Payment status synchronization

### 4. 🔗 OAuth Integrations
**Status**: ✅ Gedeeltelijk geïmplementeerd
**Supported**:
- Google (Gmail, Calendar, Drive)
- Microsoft Outlook (Mail, Calendar)
- WhatsApp Business API

### 5. 📊 Dashboard & Analytics
**Status**: ✅ Actief
**Features**:
- Revenue tracking met groei percentages
- Client statistics
- Invoice/Quote overview
- Recent activity feed
- Quick actions

### 6. 🔐 Authentication & Security
**Status**: ✅ Volledig geïmplementeerd
**Features**:
- NextAuth.js integration
- Google OAuth + Credentials login
- Session management
- Password hashing (bcrypt)
- JWT tokens
- Protected routes

### 7. 📱 WhatsApp Business Integration
**Status**: ✅ Actief
**Features**:
- Webhook handling
- Message parsing (text, audio, voice)
- User resolution by phone number
- Automated responses
- Draft feedback system

---

## 🚀 Deployment & Infrastructure

### Vercel Configuration
**Bestand**: `vercel.json`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Framework**: Next.js
- **Function Timeout**: 30 seconds
- **CORS Headers**: Configured voor API routes
- **Auto-redirect**: `/` → `/dashboard` (if authenticated)

### Environment Variables (Vercel)
Alle environment variables zijn geconfigureerd in Vercel:
- Database connection
- OAuth credentials
- API keys
- Webhook secrets
- Encryption keys

### Database Setup
- **Provider**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: `prisma migrate dev`
- **Seed Data**: `npm run db:seed`
- **Studio**: `npm run db:studio`

---

## 📈 Performance & Monitoring

### Key Metrics
- **New Message Processing**: < 5 seconden
- **Draft Feedback**: < 2 seconden  
- **Voice Processing**: < 10 seconden
- **Context Search**: < 3 seconden
- **Draft Storage**: < 1 seconde

### Error Handling
- **User Not Found**: Registratie link met error message
- **Audio Processing**: Fallback naar text processing
- **API Errors**: Retry logic en graceful degradation
- **Validation**: Zod schema validation

---

## 🔧 Development & Testing

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:studio    # Database GUI
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset + seed
npm run test         # Jest tests
npm run test:watch   # Watch mode tests
npm run test:e2e     # Playwright E2E tests
```

### Test User
- **Email**: `test@zzpchat.nl`
- **Password**: `test123`

---

## 🎯 Roadmap & Next Steps

### Immediate Priorities
1. **Voice Memo Processing**: Verbetering van audio handling
2. **RAG Implementation**: Context-aware responses
3. **Google Calendar Integration**: Appointment management
4. **Email Integration**: Automated invoice/quote sending
5. **Performance Optimization**: Response time improvements

### Future Features (Epic 1 continuation)
- Advanced AI business advice
- Automated invoice generation from time entries
- Client communication templates
- Revenue forecasting
- Tax calculation assistance

---

## 📞 Support & Contact

- **Email**: support@zzpchat.nl
- **Repository**: Private (proprietary software)
- **Documentation**: This file + API_DOCUMENTATION.md
- **Workflow Docs**: n8n-workflows/GROK_WORKFLOW_DOCUMENTATION.md

---

## 🔒 Security Considerations

- **Data Isolation**: User data is strictly isolated
- **Input Validation**: Zod schemas for all inputs
- **Authentication**: JWT tokens with NextAuth.js
- **Encryption**: OAuth tokens encrypted at rest
- **Rate Limiting**: TODO - implement rate limiting
- **CORS**: Configured for API security
- **Environment Variables**: All secrets in environment

---

**Laatste Update**: 2 januari 2025  
**Versie**: 2.0.0  
**Status**: Epic 1 - Active Development
