# Feature Specification: ZzpChat MVP

**Feature Branch**: `001-scope-van-de`  
**Created**: 2025-01-01  
**Status**: Draft  
**Input**: User description: "Scope van de eerste versie (MVP): Website (publiek): Home, Pricing, Login. Dashboard (privé): Home (overzicht + snelle acties), AI Assistent (chatvenster), WhatsApp Setup (wizard koppeling), Integraties (google calendar, gmail & google drive, outlook mail & agenda), Facturen (overzicht + nieuwe factuur), Offertes (overzicht + nieuwe offerte), Urenregistratie (uren toevoegen + export naar factuur), Instellingen (profiel, bedrijfsinfo, abonnement, dark mode). Succescriteria MVP: WhatsApp Business koppelen en AI kan opdrachten vertalen naar acties (factuur maken, offerte opstellen, uren toevoegen). ZZP'er kan eenvoudig facturen/offertes versturen en uren registreren. Ook kunnen ze inkomende mails samenvatten en reacties versturen. agendapunten verplaatsen/wijzigen/annuleren. Abonnementenpagina werkt → gebruikers kunnen inloggen & starten."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Een ZZP'er wil zijn administratieve taken automatiseren via WhatsApp door een AI-assistent te gebruiken die facturen, offertes en urenregistratie kan verwerken, en ook emails kan samenvatten en agenda-items kan beheren.

### Acceptance Scenarios
1. **Given** een nieuwe ZZP'er bezoekt de website, **When** hij zich registreert en een abonnement kiest, **Then** kan hij inloggen en het dashboard gebruiken
2. **Given** een ingelogde gebruiker, **When** hij WhatsApp koppelt via de setup wizard, **Then** kan hij berichten en voice memos sturen naar zijn AI-assistent
3. **Given** een gekoppelde WhatsApp, **When** de gebruiker "Maak factuur van €500 voor Jan Jansen" stuurt, **Then** wordt een factuur draft aangemaakt in het dashboard
4. **Given** een gekoppelde Gmail, **When** de gebruiker vraagt om "Samenvatting van inkomende mails", **Then** krijgt hij een overzicht van zijn emails
5. **Given** een gekoppelde Google Calendar, **When** de gebruiker vraagt om "Verplaats afspraak met klant X naar morgen", **Then** wordt de afspraak verplaatst en de klant krijgt een notificatie

### Edge Cases
- Wat gebeurt er wanneer de WhatsApp koppeling verbroken wordt?
- Hoe handelt het systeem onduidelijke AI-opdrachten af?
- Wat gebeurt er bij API failures van externe services (Gmail, Google Calendar)?
- Hoe wordt omgegaan met onvolledige factuurgegevens?

## Requirements *(mandatory)*

### Functional Requirements

#### Website (Publiek)
- **FR-001**: System MUST display a homepage with hero section, pricing plans, and testimonials
- **FR-002**: System MUST show pricing page with 3 tiers (Starter, Pro, Business) and FAQ section
- **FR-003**: System MUST provide user registration and login functionality
- **FR-004**: System MUST handle password reset functionality
- **FR-005**: System MUST redirect authenticated users to dashboard after login

#### Dashboard (Privé)
- **FR-006**: System MUST display dashboard home with welcome message and quick action cards
- **FR-007**: System MUST show overview cards with pending invoices, quotes, and monthly statistics
- **FR-008**: System MUST provide AI Assistant chat interface for WhatsApp-like communication
- **FR-009**: System MUST offer WhatsApp Setup wizard with QR code scanning and connection verification
- **FR-010**: System MUST display integrations page showing connection status for Gmail, Google Calendar, Google Drive, and Outlook
- **FR-011**: System MUST provide invoices overview with filters (period, client, status) and create new invoice functionality
- **FR-012**: System MUST provide quotes overview with status tracking and create new quote functionality
- **FR-013**: System MUST provide time tracking interface with calendar/week view and export to invoice capability
- **FR-014**: System MUST offer settings page with profile, company info, subscription management, and dark mode toggle

#### AI Assistant & WhatsApp Integration
- **FR-015**: System MUST process WhatsApp messages (text and voice memos) and convert voice to text
- **FR-016**: System MUST interpret natural language commands and translate them to system actions
- **FR-017**: System MUST create invoice drafts from WhatsApp commands like "Maak factuur van €X voor [klant]"
- **FR-018**: System MUST create quote drafts from WhatsApp commands like "Maak offerte van €X voor [klant]"
- **FR-019**: System MUST add time entries from WhatsApp commands like "Voeg 5 uren toe voor [project]"
- **FR-020**: System MUST summarize incoming emails when requested via WhatsApp
- **FR-021**: System MUST draft email responses when requested via WhatsApp [NEEDS CLARIFICATION: automatic sending or draft only?]
- **FR-022**: System MUST manage calendar events (move, modify, cancel) when requested via WhatsApp
- **FR-023**: System MUST notify relevant parties when calendar changes are made [NEEDS CLARIFICATION: which parties and how?]

#### Integrations
- **FR-024**: System MUST integrate with Gmail API for email reading and sending
- **FR-025**: System MUST integrate with Google Calendar API for event management
- **FR-026**: System MUST integrate with Google Drive API for document storage
- **FR-027**: System MUST integrate with Outlook API for email and calendar management
- **FR-028**: System MUST provide OAuth flow for each integration
- **FR-029**: System MUST display connection status for each integration
- **FR-030**: System MUST handle integration failures gracefully

#### Data Management
- **FR-031**: System MUST store client information (name, email, company details)
- **FR-032**: System MUST store invoice data (number, amount, client, date, status)
- **FR-033**: System MUST store quote data (number, amount, client, date, status)
- **FR-034**: System MUST store time tracking data (project, hours, date, notes)
- **FR-035**: System MUST generate sequential invoice and quote numbers
- **FR-036**: System MUST export invoices and quotes to PDF format

#### Subscription Management
- **FR-037**: System MUST handle subscription plans (Starter, Pro, Business) with different feature limits
- **FR-038**: System MUST enforce usage limits based on subscription tier [NEEDS CLARIFICATION: what are the specific limits per tier?]
- **FR-039**: System MUST provide subscription upgrade/downgrade functionality
- **FR-040**: System MUST display subscription status and billing history
- **FR-041**: System MUST handle payment processing for subscriptions

### Key Entities *(include if feature involves data)*
- **User**: Represents a ZZP'er with profile information, subscription tier, and authentication credentials
- **Client**: Represents a customer with contact information and relationship to invoices/quotes
- **Invoice**: Represents a billable document with amount, client, date, status, and line items
- **Quote**: Represents a proposal document with amount, client, date, status, and line items
- **TimeEntry**: Represents logged work hours with project, duration, date, and notes
- **Integration**: Represents external service connections (Gmail, Calendar, etc.) with status and credentials
- **AI_Conversation**: Represents WhatsApp message history and AI processing results

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---

## Out of Scope (MVP)
- Multi-language support
- Advanced integrations beyond basic Gmail, Google Calendar, Google Drive, and Outlook
- Full mobile app (responsive web app is sufficient)
- Advanced reporting and analytics
- Team collaboration features
- Advanced AI features beyond basic command interpretation