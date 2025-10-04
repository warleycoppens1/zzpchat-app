# Tasks: ZzpChat MVP

**Input**: Design documents from `/specs/001-scope-van-de/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/` at repository root
- Based on Next.js 14 with App Router structure

## Phase 3.1: Setup
- [x] T001 Create Next.js project structure (app/, components/, lib/, prisma/)
- [x] T002 Initialize package.json with Next.js 14, TypeScript, Tailwind CSS, Prisma, NextAuth.js dependencies
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript config
- [x] T004 [P] Setup Tailwind CSS configuration with dark mode support
- [x] T005 [P] Initialize Prisma schema and Supabase database connection
- [x] T006 [P] Configure NextAuth.js with Google OAuth and email/password providers
- [x] T007 Create environment variables template (.env.example)
- [x] T008 [P] Setup Prisma Accelerate connection and test database operations

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T008 [P] Contract test POST /api/auth/signup in tests/contract/test_auth_signup.ts
- [ ] T009 [P] Contract test POST /api/auth/signin in tests/contract/test_auth_signin.ts
- [ ] T010 [P] Contract test POST /api/ai/process-message in tests/contract/test_ai_process.ts
- [ ] T011 [P] Contract test POST /api/whatsapp/webhook in tests/contract/test_whatsapp_webhook.ts
- [ ] T012 [P] Contract test GET /api/invoices in tests/contract/test_invoices_get.ts
- [ ] T013 [P] Contract test POST /api/invoices in tests/contract/test_invoices_post.ts
- [ ] T014 [P] Contract test GET /api/quotes in tests/contract/test_quotes_get.ts
- [ ] T015 [P] Contract test POST /api/quotes in tests/contract/test_quotes_post.ts
- [ ] T016 [P] Contract test GET /api/time-entries in tests/contract/test_time_entries_get.ts
- [ ] T017 [P] Contract test POST /api/time-entries in tests/contract/test_time_entries_post.ts

### Integration Tests
- [ ] T018 [P] Integration test user registration flow in tests/integration/test_user_registration.ts
- [ ] T019 [P] Integration test WhatsApp AI processing in tests/integration/test_whatsapp_ai.ts
- [ ] T020 [P] Integration test invoice creation via AI in tests/integration/test_ai_invoice_creation.ts
- [ ] T021 [P] Integration test OAuth integrations in tests/integration/test_oauth_integrations.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Models
- [ ] T022 [P] User model in prisma/schema.prisma
- [ ] T023 [P] Client model in prisma/schema.prisma
- [ ] T024 [P] Invoice model in prisma/schema.prisma
- [ ] T025 [P] Quote model in prisma/schema.prisma
- [ ] T026 [P] TimeEntry model in prisma/schema.prisma
- [ ] T027 [P] Integration model in prisma/schema.prisma
- [ ] T028 [P] AI_Conversation model in prisma/schema.prisma
- [ ] T029 Run Prisma migration to Supabase and generate client

### Core Services
- [ ] T030 [P] UserService in lib/services/user-service.ts
- [ ] T031 [P] ClientService in lib/services/client-service.ts
- [ ] T032 [P] InvoiceService in lib/services/invoice-service.ts
- [ ] T033 [P] QuoteService in lib/services/quote-service.ts
- [ ] T034 [P] TimeEntryService in lib/services/time-entry-service.ts
- [ ] T035 [P] AIService in lib/services/ai-service.ts
- [ ] T036 [P] WhatsAppService in lib/services/whatsapp-service.ts
- [ ] T037 [P] IntegrationService in lib/services/integration-service.ts

### API Endpoints
- [ ] T038 POST /api/auth/signup endpoint in app/api/auth/signup/route.ts
- [ ] T039 POST /api/auth/signin endpoint in app/api/auth/signin/route.ts
- [ ] T040 GET /api/dashboard/stats endpoint in app/api/dashboard/stats/route.ts
- [ ] T041 POST /api/ai/process-message endpoint in app/api/ai/process-message/route.ts
- [ ] T042 GET /api/ai/conversation-history endpoint in app/api/ai/conversation-history/route.ts
- [ ] T043 POST /api/whatsapp/webhook endpoint in app/api/whatsapp/webhook/route.ts
- [ ] T044 GET /api/whatsapp/status endpoint in app/api/whatsapp/status/route.ts
- [ ] T045 GET /api/invoices endpoint in app/api/invoices/route.ts
- [ ] T046 POST /api/invoices endpoint in app/api/invoices/route.ts
- [ ] T047 GET /api/invoices/[id] endpoint in app/api/invoices/[id]/route.ts
- [ ] T048 PUT /api/invoices/[id] endpoint in app/api/invoices/[id]/route.ts
- [ ] T049 DELETE /api/invoices/[id] endpoint in app/api/invoices/[id]/route.ts
- [ ] T050 GET /api/quotes endpoint in app/api/quotes/route.ts
- [ ] T051 POST /api/quotes endpoint in app/api/quotes/route.ts
- [ ] T052 GET /api/time-entries endpoint in app/api/time-entries/route.ts
- [ ] T053 POST /api/time-entries endpoint in app/api/time-entries/route.ts
- [ ] T054 GET /api/integrations endpoint in app/api/integrations/route.ts
- [ ] T055 POST /api/integrations/[type]/connect endpoint in app/api/integrations/[type]/connect/route.ts
- [ ] T056 DELETE /api/integrations/[type] endpoint in app/api/integrations/[type]/route.ts

## Phase 3.4: Frontend Implementation

### Public Website
- [x] T057 [P] Homepage component in app/page.tsx with hero section, pricing, testimonials
- [x] T058 [P] Pricing page component in app/pricing/page.tsx with 3 tiers and FAQ
- [x] T059 [P] Login page component in app/login/page.tsx with signin/signup forms
- [x] T060 [P] Public layout with navigation in app/layout.tsx

### Dashboard
- [x] T061 [P] Dashboard layout with sidebar navigation in app/dashboard/layout.tsx
- [x] T062 [P] Dashboard home page in app/dashboard/page.tsx with stats and quick actions
- [ ] T063 [P] AI Assistant chat interface in app/dashboard/ai/page.tsx
- [ ] T064 [P] WhatsApp Setup wizard in app/dashboard/whatsapp-setup/page.tsx
- [ ] T065 [P] Integrations overview page in app/dashboard/integrations/page.tsx
- [ ] T066 [P] Invoices overview page in app/dashboard/invoices/page.tsx
- [ ] T067 [P] Create invoice page in app/dashboard/invoices/new/page.tsx
- [ ] T068 [P] Quotes overview page in app/dashboard/quotes/page.tsx
- [ ] T069 [P] Create quote page in app/dashboard/quotes/new/page.tsx
- [ ] T070 [P] Time tracking page in app/dashboard/time-entries/page.tsx
- [ ] T071 [P] Settings page in app/dashboard/settings/page.tsx with profile, company, subscription, dark mode

### Shared Components
- [ ] T072 [P] Button component in components/ui/button.tsx
- [ ] T073 [P] Card component in components/ui/card.tsx
- [ ] T074 [P] Input component in components/ui/input.tsx
- [ ] T075 [P] Form components in components/ui/form.tsx
- [ ] T076 [P] Dialog component in components/ui/dialog.tsx
- [ ] T077 [P] Table component in components/ui/table.tsx
- [ ] T078 [P] Navigation components in components/navigation/
- [ ] T079 [P] Dark mode toggle component in components/theme-toggle.tsx

## Phase 3.5: Integration & External Services

### WhatsApp Integration
- [ ] T080 Configure WhatsApp Business API webhook endpoint
- [ ] T081 Implement message processing and signature verification
- [ ] T082 [P] Voice message transcription using OpenAI Whisper API
- [ ] T083 [P] WhatsApp message sending functionality

### AI Integration
- [ ] T084 [P] OpenAI GPT-4 API integration for natural language processing
- [ ] T085 [P] AI command interpretation and action mapping
- [ ] T086 [P] Context management for conversation history

### OAuth Integrations
- [ ] T087 [P] Google OAuth integration for Gmail API
- [ ] T088 [P] Google OAuth integration for Google Calendar API
- [ ] T089 [P] Google OAuth integration for Google Drive API
- [ ] T090 [P] Microsoft OAuth integration for Outlook API
- [ ] T091 [P] OAuth token storage and refresh logic

### Payment Integration
- [ ] T092 [P] Stripe integration for subscription management
- [ ] T093 [P] Subscription tier enforcement logic
- [ ] T094 [P] Billing history and invoice generation

## Phase 3.6: Polish & Validation

### Testing
- [ ] T095 [P] Unit tests for all services in tests/unit/
- [ ] T096 [P] Component tests with React Testing Library
- [ ] T097 [P] End-to-end tests with Playwright for critical user flows
- [ ] T098 [P] API integration tests for external services

### Performance & Security
- [ ] T099 [P] Performance optimization for API responses
- [ ] T100 [P] Security headers and CORS configuration
- [ ] T101 [P] Input validation and sanitization
- [ ] T102 [P] Error handling and logging implementation

### Documentation & Deployment
- [ ] T103 [P] API documentation with OpenAPI/Swagger
- [ ] T104 [P] README.md with setup and deployment instructions
- [ ] T105 [P] Environment configuration for production
- [ ] T106 [P] Vercel deployment configuration
- [ ] T107 [P] Database deployment scripts

## Dependencies
- Setup (T001-T007) before everything
- Tests (T008-T021) before implementation (T022-T106)
- Models (T022-T029) before services (T030-T037)
- Services (T030-T037) before API endpoints (T038-T056)
- API endpoints before frontend (T057-T071)
- Core implementation before integration (T080-T094)
- Everything before polish (T095-T107)

## Parallel Execution Examples

### Phase 3.1 Setup (T003-T007 can run together):
```
Task: "Configure ESLint, Prettier, and TypeScript config"
Task: "Setup Tailwind CSS configuration with dark mode support"
Task: "Initialize Prisma schema and database connection"
Task: "Configure NextAuth.js with Google OAuth and email/password providers"
Task: "Create environment variables template (.env.example)"
```

### Phase 3.2 Contract Tests (T008-T017 can run together):
```
Task: "Contract test POST /api/auth/signup in tests/contract/test_auth_signup.ts"
Task: "Contract test POST /api/auth/signin in tests/contract/test_auth_signin.ts"
Task: "Contract test POST /api/ai/process-message in tests/contract/test_ai_process.ts"
Task: "Contract test POST /api/whatsapp/webhook in tests/contract/test_whatsapp_webhook.ts"
Task: "Contract test GET /api/invoices in tests/contract/test_invoices_get.ts"
Task: "Contract test POST /api/invoices in tests/contract/test_invoices_post.ts"
Task: "Contract test GET /api/quotes in tests/contract/test_quotes_get.ts"
Task: "Contract test POST /api/quotes in tests/contract/test_quotes_post.ts"
Task: "Contract test GET /api/time-entries in tests/contract/test_time_entries_get.ts"
Task: "Contract test POST /api/time-entries in tests/contract/test_time_entries_post.ts"
```

### Phase 3.3 Database Models (T022-T028 can run together):
```
Task: "User model in prisma/schema.prisma"
Task: "Client model in prisma/schema.prisma"
Task: "Invoice model in prisma/schema.prisma"
Task: "Quote model in prisma/schema.prisma"
Task: "TimeEntry model in prisma/schema.prisma"
Task: "Integration model in prisma/schema.prisma"
Task: "AI_Conversation model in prisma/schema.prisma"
```

### Phase 3.3 Core Services (T030-T037 can run together):
```
Task: "UserService in lib/services/user-service.ts"
Task: "ClientService in lib/services/client-service.ts"
Task: "InvoiceService in lib/services/invoice-service.ts"
Task: "QuoteService in lib/services/quote-service.ts"
Task: "TimeEntryService in lib/services/time-entry-service.ts"
Task: "AIService in lib/services/ai-service.ts"
Task: "WhatsAppService in lib/services/whatsapp-service.ts"
Task: "IntegrationService in lib/services/integration-service.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow TDD approach: write failing tests first
- Use TypeScript strict mode
- Follow Next.js 14 App Router conventions
- Implement responsive design with Tailwind CSS
- Ensure GDPR compliance for data handling
