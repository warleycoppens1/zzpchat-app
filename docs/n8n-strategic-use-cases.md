# n8n Strategische Use Cases

## Overzicht: Wanneer AI Tools vs. n8n?

### AI Tools (Direct, Conversational)
✅ Gebruik voor:
- Directe vragen: "Check mijn e-mail", "Maak een factuur", "Zoek contact"
- On-demand acties via chat
- Simple, single-step tasks
- Real-time responses

### n8n Workflows (Automation, Complex)
✅ Gebruik voor:
- Scheduled automatisering (dagelijks, wekelijks)
- Event-driven workflows (webhooks, triggers)
- Multi-step business processes
- Data transformatie en conditionele logica
- Bulk operations
- Integraties met externe triggers

---

## Concrete Use Cases voor n8n

### 1. Scheduled Automatisering

#### Use Case: Dagelijkse E-mail Samenvatting
**Trigger**: Schedule (dagelijks 08:00)

**Workflow**:
1. Haal ongelezen Gmail op
2. Categoriseer e-mails (facturen, offertes, klanten, etc.)
3. Genereer AI samenvatting per categorie
4. Verstuur samenvatting naar gebruiker

**Waarom n8n**: AI kan dit wel, maar dit is een scheduled taak die automatisch moet draaien zonder user input.

---

#### Use Case: Automatische Factuur Herinneringen
**Trigger**: Schedule (dagelijks 09:00)

**Workflow**:
1. Zoek facturen met status "sent" en dueDate < vandaag + 7 dagen
2. Voor elke factuur:
   - Check of er al een herinnering is verstuurd
   - Genereer herinnering e-mail template
   - Verstuur via Gmail/Outlook
   - Update factuur status

**Waarom n8n**: Multi-step proces met conditionele logica en bulk operations.

---

#### Use Case: Wekelijks Time Tracking Rapport
**Trigger**: Schedule (elke maandag 09:00)

**Workflow**:
1. Haal tijd entries op van vorige week
2. Groepeer per project/klant
3. Bereken totaal uren
4. Genereer PDF rapport
5. Upload naar Google Drive in map "Rapporten"
6. Verstuur samenvatting via e-mail

**Waarom n8n**: Complex proces met data aggregatie, PDF generatie, en multi-service integratie.

---

### 2. Event-Driven Automatisering

#### Use Case: Nieuwe Gmail → Contact Aanmaken
**Trigger**: Gmail Webhook (nieuwe e-mail van onbekend adres)

**Workflow**:
1. Ontvang webhook van Gmail
2. Extract afzender e-mail
3. Check of contact al bestaat
4. Als niet: Maak nieuw contact aan via ZzpChat API
5. Tag contact met "auto-created"
6. Stuur welkomst e-mail (optioneel)

**Waarom n8n**: Externe trigger (Gmail webhook) die automatisch moet draaien.

---

#### Use Case: Factuur Betaald → Automatische Acties
**Trigger**: Webhook van payment provider of manual trigger

**Workflow**:
1. Factuur status updaten naar "paid"
2. Verstuur bevestiging e-mail naar klant
3. Download factuur PDF
4. Upload naar Google Drive in map "Betaalde Facturen"
5. Update boekhouding export (CSV/Excel)
6. Notificeer gebruiker

**Waarom n8n**: Multi-step proces dat automatisch moet draaien bij een event.

---

#### Use Case: Google Calendar Event → Time Entry
**Trigger**: Google Calendar Webhook (nieuwe event met specifieke tag/label)

**Workflow**:
1. Detecteer nieuw calendar event met tag "#time-tracking"
2. Extract: titel, tijd, duur, locatie
3. Maak time entry aan in ZzpChat
4. Koppel aan project/klant indien mogelijk
5. Bevestig aan gebruiker

**Waarom n8n**: Automatische koppeling tussen calendar events en time tracking.

---

### 3. Complexe Business Processes

#### Use Case: Offerte → Factuur Conversie
**Trigger**: Manual of scheduled (check offertes die geaccepteerd zijn)

**Workflow**:
1. Zoek offertes met status "accepted" en validUntil < vandaag
2. Voor elke offerte:
   - Valideer klant gegevens
   - Converteer naar factuur
   - Genereer factuur PDF
   - Verstuur via e-mail
   - Archiveer offerte in Drive
   - Update offerte status

**Waarom n8n**: Complex proces met data transformatie, validatie, en multi-step acties.

---

#### Use Case: Bulk Factuur Generatie
**Trigger**: Manual (gebruiker triggert met parameters)

**Workflow**:
1. Ontvang lijst van klanten + bedragen
2. Voor elke klant:
   - Valideer klant bestaat
   - Maak factuur aan
   - Genereer PDF
   - Upload naar Drive
   - Verstuur e-mail
3. Genereer overzicht rapport
4. Notificeer gebruiker bij completion

**Waarom n8n**: Bulk operations die efficiënt parallel kunnen draaien.

---

#### Use Case: Automatische Klant Follow-up
**Trigger**: Scheduled (elke vrijdag)

**Workflow**:
1. Zoek klanten zonder factuur in laatste 90 dagen
2. Genereer gepersonaliseerde follow-up e-mail per klant
3. Voeg contact historie toe (laatste factuur, offerte, etc.)
4. Verstuur e-mails
5. Log acties voor tracking

**Waarom n8n**: Scheduled, multi-step proces met personalisatie.

---

### 4. Data Integratie & Synchronisatie

#### Use Case: Google Drive → ZzpChat Document Sync
**Trigger**: Google Drive Webhook (nieuw bestand in specifieke map)

**Workflow**:
1. Detecteer nieuw bestand in "Facturen" map
2. Download bestand
3. Extract data via OCR of parsing (bijv. factuurnummer, bedrag)
4. Check of factuur al bestaat
5. Als niet: maak contact + factuur aan
6. Upload naar juiste Drive map
7. Notificeer gebruiker

**Waarom n8n**: Externe trigger met data transformatie en conditional logic.

---

#### Use Case: Outlook Calendar → Project Planning
**Trigger**: Outlook Calendar Webhook of scheduled sync

**Workflow**:
1. Haal alle events op van komende week
2. Match events met bestaande projecten (op basis van titel/omschrijving)
3. Maak/update project entries
4. Update time entries indien relevant
5. Genereer weekplanning overzicht

**Waarom n8n**: Scheduled sync met data matching en updates.

---

## Architectuur Voordelen

### n8n als Orchestration Layer

```
┌─────────────┐
│  External   │
│  Triggers   │ → n8n Workflow → ZzpChat API → Database
│ (Gmail, etc)│
└─────────────┘

┌─────────────┐
│   User      │
│   Chat      │ → AI Assistant → Direct Tools → Database
└─────────────┘
```

### Waarom deze scheiding?

1. **Separation of Concerns**
   - AI: Conversational interface, on-demand
   - n8n: Automation engine, scheduled/event-driven

2. **Scalability**
   - AI tools: User-initiated, low volume
   - n8n workflows: High volume, parallel execution

3. **Reliability**
   - AI tools: Real-time, but can fail gracefully
   - n8n workflows: Retry logic, error handling, logging

4. **Flexibility**
   - AI tools: Fixed functionality, simple
   - n8n workflows: Customizable, complex logic

---

## Aanbevolen Workflow Patterns

### Pattern 1: Scheduled Reports
**Trigger**: Schedule (daily/weekly/monthly)
**Actions**: Data aggregation → Generate report → Upload → Email

### Pattern 2: Event-Driven Sync
**Trigger**: External webhook
**Actions**: Receive data → Transform → Create/Update → Notify

### Pattern 3: Conditional Automation
**Trigger**: Schedule + Conditions
**Actions**: Check conditions → Execute actions → Log results

### Pattern 4: Bulk Operations
**Trigger**: Manual or scheduled
**Actions**: Process list → Parallel execution → Aggregate results

---

## Implementatie Prioriteit

### MVP (Must Have)
1. ✅ Scheduled e-mail samenvatting
2. ✅ Factuur herinneringen
3. ✅ Event-driven contact creatie

### Phase 2 (Should Have)
4. Wekelijks time tracking rapport
5. Offerte → Factuur conversie
6. Google Drive sync

### Phase 3 (Nice to Have)
7. Bulk factuur generatie
8. Automatische klant follow-up
9. Outlook calendar sync

---

## Conclusie

**AI Tools**: Perfect voor directe, conversational acties
**n8n Workflows**: Perfect voor automatisering, scheduling, complex processes

**Samen**: Complete oplossing die zowel interactieve als geautomatiseerde functionaliteit biedt!

