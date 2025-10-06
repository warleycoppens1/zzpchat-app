# Implementation Plan: ZzpChat MVP

**Branch**: `001-scope-van-de` | **Date**: 2025-01-01 | **Last Updated**: 2025-01-29 | **Spec**: /specs/001-scope-van-de/spec.md
**Input**: Feature specification from `/specs/001-scope-van-de/spec.md`
**Status**: ✅ **IMPLEMENTATION COMPLETE** - SimAI Workflow Integration Ready

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
ZzpChat MVP is een webapplicatie voor ZZP'ers met WhatsApp AI-assistent die administratieve taken automatiseert. Technische aanpak: Next.js frontend + Node.js backend + PostgreSQL database + WhatsApp Business API + OpenAI API integratie + **SimAI Workflow Automation**.

**🎯 Current Status**: Core implementation complete, SimAI workflow integration ready for deployment.

## Technical Context
**Language/Version**: TypeScript 5.0, Node.js 20, React 18, Next.js 14  
**Primary Dependencies**: Next.js, Prisma ORM, NextAuth.js, OpenAI API, WhatsApp Business API, Tailwind CSS, **SimAI Workflow Automation**  
**Storage**: PostgreSQL database met Prisma ORM  
**Testing**: Jest, React Testing Library, Playwright voor E2E  
**Target Platform**: Web application (responsive), Linux server deployment  
**Project Type**: web (frontend + backend)  
**Performance Goals**: <2s response time voor WhatsApp messages, 99.9% uptime  
**Constraints**: GDPR compliant, sub-2s AI response time, offline-capable voor basis functionaliteit  
**Scale/Scope**: 1000+ ZZP'ers, 50+ API endpoints, 15+ UI screens

## 🚀 Current Implementation Status

### ✅ **Completed Features**
- **Core Backend**: All API endpoints implemented and tested
- **Database Schema**: Complete Prisma schema with all entities
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **WhatsApp Integration**: Webhook handling, message processing, audio transcription
- **AI Services**: OpenAI GPT-4 integration, Whisper audio transcription
- **Draft System**: Complete draft management (pending, store, update)
- **User Management**: Phone-based user resolution, subscription tiers
- **Context Search**: Intelligent search across clients, invoices, quotes
- **SimAI Integration**: WhatsApp AI Assistant workflow ready

### 🔄 **SimAI Workflow Integration**
**Platform**: SimAI Workflow Automation  
**Status**: ✅ Ready for deployment

**Workflow Blocks Implemented**:
- ✅ Block 1: Send Acknowledgment (`whatsappService.sendAcknowledgment()`)
- ✅ Block 2: Parse WhatsApp Data (webhook `processWhatsAppMessage()`)
- ✅ Block 3: Resolve User by Phone (`POST /api/users/resolve-by-phone`)
- ✅ Block 4: User Found? (condition in SimAI)
- ✅ Block 6: Check Pending Drafts (`GET /api/drafts/pending`)
- ✅ Block 7: Has Pending Draft? (condition in SimAI)
- ✅ Block 8: Analyze Feedback (`aiAgentService.analyzeFeedback()`)
- ✅ Block 10A-C: Draft Actions (`POST /api/drafts/update`)

**Services Created**:
- ✅ `WhatsAppService` - Message sending, acknowledgments, media handling
- ✅ `AIAgentService` - Feedback analysis, intent detection, draft generation
- ✅ Audio transcription with OpenAI Whisper
- ✅ SimAI webhook forwarding (optional)

### 🗑️ **Cleanup Completed**
- ✅ Removed n8n integration and references
- ✅ Updated all documentation (README.md, PROJECT_OVERVIEW.md, API_DOCUMENTATION.md)
- ✅ Cleaned environment variables
- ✅ Removed n8n-workflows directory  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### WhatsApp-First Design ✅
- WhatsApp Business API als primaire interface
- AI-assistent centraal in gebruikerservaring
- Voice memos en tekstberichten gelijk behandeld

### Eenvoud & Intuïtie ✅
- Progressive disclosure: start met basis features
- Minimale uitleg nodig voor gebruikers
- Complexe taken geabstraheerd naar simpele commando's

### Betrouwbaarheid & Veiligheid ✅
- GDPR-compliant data handling
- End-to-end encryptie voor gevoelige data
- Transparante audit trail voor AI-beslissingen

### AI-Assistent Centraal ✅
- Alle administratieve acties via AI-assistent
- Gebruiker behoudt controle
- Duidelijke scheiding tussen AI-voorstellen en definitieve acties

### Flexibiliteit & Schaalbaarheid ✅
- Modulaire architectuur
- API-first design
- Start klein, schaal uit

## Project Structure

### Documentation (this feature)
```
specs/001-scope-van-de/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── models/          # Prisma schema, entity definitions
│   ├── services/        # Business logic, AI processing
│   ├── api/             # REST API endpoints
│   ├── integrations/    # WhatsApp, OpenAI, Gmail, Calendar APIs
│   └── auth/            # NextAuth.js configuration
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # Service integration tests
    └── unit/            # Unit tests

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Next.js pages (public + dashboard)
│   ├── services/        # API client, state management
│   └── hooks/           # Custom React hooks
└── tests/
    ├── components/      # Component tests
    └── e2e/             # End-to-end tests

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── seed.ts              # Seed data for development
```

**Structure Decision**: Web application structure chosen because ZzpChat requires both public website (home, pricing, login) and private dashboard with real-time features. Frontend/backend separation allows for independent scaling and deployment.

## Phase 0: Outline & Research

### Research Tasks Generated:
1. **WhatsApp Business API Integration**: Research webhook setup, message types, rate limits
2. **OpenAI API Integration**: Research GPT models, prompt engineering, response handling
3. **OAuth Integrations**: Research Gmail, Google Calendar, Outlook API authentication flows
4. **NextAuth.js Setup**: Research authentication strategies, session management
5. **Prisma Database Design**: Research schema design for invoices, quotes, time tracking
6. **Tailwind CSS Dark Mode**: Research implementation patterns, color tokens
7. **Deployment Strategy**: Research Vercel/Netlify deployment, environment variables

### Consolidated Findings (research.md):

**Decision**: Next.js 14 with App Router for full-stack development
**Rationale**: Unified development experience, built-in API routes, excellent TypeScript support, Vercel deployment optimization
**Alternatives considered**: Separate React + Express.js (more complex setup), Remix (smaller ecosystem)

**Decision**: Prisma ORM with PostgreSQL
**Rationale**: Type-safe database access, excellent migration system, built-in query optimization
**Alternatives considered**: TypeORM (less type safety), MongoDB (less ACID compliance for financial data)

**Decision**: NextAuth.js for authentication
**Rationale**: Built-in OAuth providers, session management, CSRF protection
**Alternatives considered**: Auth0 (cost), Supabase Auth (vendor lock-in)

**Decision**: OpenAI GPT-4 for AI processing
**Rationale**: Best natural language understanding, reliable API, good documentation
**Alternatives considered**: Claude API (less integration examples), local models (insufficient performance)

**Decision**: WhatsApp Business API via Meta
**Rationale**: Official API, webhook support, voice message handling
**Alternatives considered**: WhatsApp Web scraping (against ToS), Telegram Bot API (different platform)

## Phase 1: Design & Contracts

### Data Model (data-model.md):
**User Entity**: id, email, name, companyName, subscriptionTier, createdAt, updatedAt
**Client Entity**: id, name, email, company, phone, address, userId
**Invoice Entity**: id, number, amount, status, clientId, userId, dueDate, createdAt
**Quote Entity**: id, number, amount, status, clientId, userId, validUntil, createdAt
**TimeEntry Entity**: id, project, hours, date, notes, clientId, userId, createdAt
**Integration Entity**: id, type, status, credentials, userId, lastSync

### API Contracts (/contracts/) - ✅ **IMPLEMENTED**:
**Authentication**: POST /api/auth/signin, POST /api/auth/signup, POST /api/auth/signout
**Dashboard**: GET /api/dashboard/stats
**WhatsApp Integration**: 
- POST /api/webhooks/whatsapp (webhook handling)
- POST /api/whatsapp/audio/transcribe (audio transcription)
- POST /api/whatsapp/audio/download (media download)
**Draft Management**: 
- GET /api/drafts/pending (check pending drafts)
- POST /api/drafts/store (store new draft)
- POST /api/drafts/update (confirm/cancel/modify draft)
**User Management**: POST /api/users/resolve-by-phone (phone-based user lookup)
**Context Search**: POST /api/context/search (intelligent data search)
**Invoices**: GET /api/invoices, POST /api/invoices, PUT /api/invoices/:id, DELETE /api/invoices/:id
**Quotes**: GET /api/quotes, POST /api/quotes, PUT /api/quotes/:id, DELETE /api/quotes/:id
**Time Tracking**: GET /api/time-entries, POST /api/time-entries, PUT /api/time-entries/:id
**Clients**: GET /api/clients, POST /api/clients, PUT /api/clients/:id, DELETE /api/clients/:id
**Webhooks**: POST /api/webhooks/mollie (payment processing)

### Contract Tests:
Each endpoint will have corresponding test files in backend/tests/contract/ with request/response schema validation.

### Quickstart Test (quickstart.md):
1. User registers and logs in
2. User connects WhatsApp Business account
3. User sends "Maak factuur van €500 voor Jan Jansen" via WhatsApp
4. AI creates invoice draft in dashboard
5. User reviews and sends invoice to client

### Agent Context Update:
Updated .cursor/commands/CURSOR.md with new tech stack and project structure.

## Phase 2: Task Planning Approach

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No violations - design follows constitutional principles*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete ✅
- [x] Phase 5: Validation passed ✅

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

**🎯 Final Status**: 
- ✅ **Core Implementation**: Complete
- ✅ **SimAI Integration**: Ready for deployment
- ✅ **Documentation**: Updated and current
- ✅ **Cleanup**: n8n references removed
- 🚀 **Ready for Production**: All systems go!

## 🚀 Deployment Instructions

### Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="your-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-verify-token"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# SimAI Integration (optional)
SIMAI_WEBHOOK_URL="https://your-simai-workflow.com/webhook"
SIMAI_API_KEY="your-simai-api-key"

# Payments
MOLLIE_API_KEY="your-mollie-api-key"
```

### SimAI Workflow Setup
1. **Import WhatsApp AI Assistant Workflow** in SimAI platform
2. **Configure Webhook URL**: Point to `https://your-domain.com/api/webhooks/whatsapp`
3. **Set API Base URL**: `https://your-domain.com/api`
4. **Test Integration**: Send test WhatsApp message

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] WhatsApp Business API webhook verified
- [ ] SimAI workflow deployed and tested
- [ ] SSL certificate installed
- [ ] Monitoring and logging configured

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*