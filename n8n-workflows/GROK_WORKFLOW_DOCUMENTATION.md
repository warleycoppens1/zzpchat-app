# ZzpChat Grok Improved Workflow Documentation

## 🚀 Overzicht

De Grok Improved Workflow is een geavanceerde n8n workflow die de beste features van de originele workflow combineert met verbeteringen van Grok AI. Het systeem biedt stateful feedback handling, verbeterde audio processing, en betere error handling.

## 🔄 Workflow Flow

```
WhatsApp → Parse → Resolve User → [Error/Check Pending] → [Draft Feedback/New Message] → [Voice/Text] → Intent → Complexity → [Direct/RAG] → Feedback → Store Draft
```

## 📋 Key Verbeteringen van Grok

### 1. **Stateful Feedback System**
- **Pending Drafts Check**: Controleert of er openstaande drafts zijn
- **Draft Feedback Loop**: Gebruikers kunnen eerdere drafts bevestigen/wijzigen
- **Improved Action Detection**: Regex-based feedback parsing

### 2. **Verbeterde Audio Handling**
- **Metadata First**: Haalt eerst audio metadata op
- **Binary Download**: Downloadt daarna het echte audio bestand
- **Better Transcription**: Meer accurate spraak-naar-tekst conversie

### 3. **Enhanced Error Handling**
- **User Not Found**: Duidelijke error message met registratie link
- **Better Message Type Detection**: Ondersteunt zowel `audio` als `voice`
- **Graceful Fallbacks**: Valt terug op defaults bij errors

### 4. **Draft Management**
- **Draft Storage**: Slaat drafts op in backend
- **Status Tracking**: Houdt draft status bij
- **Conversation History**: Koppelt drafts aan gesprekken

## 📋 Node Beschrijvingen

### Core Flow Nodes

1. **WhatsApp Webhook** - Vangt berichten op
2. **Parse WhatsApp Data** - Extraheert relevante data
3. **Resolve UserID by Phone** - Zoekt gebruiker op
4. **If User Not Found** - Error handling voor onbekende gebruikers
5. **Send Error Message** - Stuurt registratie link naar onbekende gebruikers

### Draft Management Nodes

6. **Check Pending Drafts** - Controleert openstaande drafts
7. **If Pending Draft** - Routeert naar feedback of nieuwe message
8. **Handle Draft Feedback** - Verwerkt gebruiker feedback
9. **Update Draft in Backend** - Updateert draft status

### Message Processing Nodes

10. **Check Message Type** - Detecteert voice vs text
11. **Get Audio Metadata** - Haalt audio info op
12. **Download Audio Binary** - Downloadt audio bestand
13. **Transcribe Audio** - Converteert spraak naar tekst
14. **Prepare Query** - Normaliseert input

### AI Processing Nodes

15. **Detect Intent** - Analyseert intent en complexiteit
16. **Parse Intent Response** - Parseert AI response
17. **Switch by Complexity** - Routeert naar juiste agent
18. **Direct AI Agent** - Verwerkt eenvoudige taken
19. **Vector DB Search** - Zoekt relevante context
20. **AI RAG Agent** - Verwerkt complexe taken met context

### Output Nodes

21. **Prepare Feedback Message** - Formatteert response
22. **Send Feedback to WhatsApp** - Verstuurt naar gebruiker
23. **Store Draft in Backend** - Slaat draft op

## 🔧 Setup Instructies

### 1. **Environment Variables**
```bash
# ZzpChat API
ZZPCHAT_API_URL=https://your-domain.com

# WhatsApp Business API
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# OpenAI
OPENAI_API_KEY=your_openai_key
```

### 2. **Database Migration**
```bash
# Voer database migratie uit
npx prisma db push
```

### 3. **API Endpoints**
Zorg dat deze endpoints beschikbaar zijn:
- `POST /api/users/resolve-by-phone`
- `POST /api/drafts/pending`
- `POST /api/drafts/update`
- `POST /api/drafts/store`
- `POST /api/context/search`

### 4. **n8n Import**
1. Importeer `grok-improved-workflow.json` in n8n
2. Configureer credentials voor WhatsApp en OpenAI
3. Test de webhook endpoint

## 🧪 Test Scenarios

### Scenario 1: New User
**Input**: Onbekend telefoonnummer
**Expected**: Error message met registratie link

### Scenario 2: Pending Draft
**Input**: "ja" (bevestiging)
**Expected**: Draft wordt bevestigd en opgeslagen

### Scenario 3: New Voice Message
**Input**: Spraakmemo "Maak factuur voor €500"
**Expected**: Factuur draft met preview

### Scenario 4: Complex Query
**Input**: "Maak factuur voor alle uren van vorige maand"
**Expected**: RAG agent zoekt context, maakt factuur draft

## 🔄 Feedback Loop

### 1. **Draft Creation**
- AI maakt draft
- Draft wordt opgeslagen in backend
- Preview wordt verzonden naar gebruiker

### 2. **User Response**
- Gebruiker antwoordt met feedback
- System detecteert actie (confirm/send/modify/cancel)
- Draft wordt geüpdatet

### 3. **State Management**
- System onthoudt openstaande drafts
- Volgende bericht wordt gerouteerd naar feedback handler
- Draft status wordt bijgehouden

## 🚨 Error Handling

### User Not Found
- Stuurt registratie link
- Logt error voor monitoring
- Stopt verdere processing

### Audio Processing Errors
- Fallback naar text processing
- Error logging
- Graceful degradation

### API Errors
- Retry logic voor externe APIs
- Fallback responses
- Error notifications

## 📊 Performance

- **New Message Processing**: < 5 seconden
- **Draft Feedback**: < 2 seconden
- **Voice Processing**: < 10 seconden
- **Context Search**: < 3 seconden
- **Draft Storage**: < 1 seconde

## 🔐 Security

- **Phone Validation**: Normalisatie en verificatie
- **User Isolation**: Alleen eigen data toegankelijk
- **API Authentication**: Bearer tokens
- **Input Sanitization**: Zod validation
- **Draft Security**: User ownership verification

## 🎨 Customization

### Action Detection
Pas de regex patterns aan in `Handle Draft Feedback` node:
```javascript
if (/\b(ja|bevestig|ok|yes|confirm)\b/i.test(lowerResponse)) {
  action = 'confirm';
}
```

### Error Messages
Bewerk error messages in `Send Error Message` node.

### Draft Types
Voeg nieuwe draft types toe in `getActionTypeFromDraftData` functie.

## 📈 Monitoring

### Key Metrics
- **Success Rate**: Percentage succesvolle verwerkingen
- **Response Time**: Gemiddelde response tijd
- **Error Rate**: Percentage failed requests
- **Draft Conversion**: Percentage bevestigde drafts

### Logging
- **User Actions**: Alle gebruiker interacties
- **AI Responses**: AI agent outputs
- **API Calls**: Externe API calls
- **Errors**: Alle errors met stack traces

## 🔧 Troubleshooting

### Common Issues

1. **Draft Not Found**: Check pending drafts API
2. **Audio Transcription Fails**: Check OpenAI API key
3. **User Resolution Fails**: Check phone number format
4. **WhatsApp Send Fails**: Check credentials en phone ID

### Debug Steps

1. Check n8n execution logs
2. Verify API endpoints
3. Test individual nodes
4. Check environment variables
5. Verify draft storage

## 🚀 Production Deployment

### 1. **Environment Setup**
- Configureer production environment variables
- Setup monitoring en logging
- Configure error notifications

### 2. **Database Setup**
- Run migrations
- Setup connection pooling
- Configure backups

### 3. **n8n Setup**
- Deploy n8n instance
- Configure credentials
- Setup webhook endpoints

### 4. **Testing**
- Load testing
- Error scenario testing
- User acceptance testing

## 🎉 Conclusie

De Grok Improved Workflow biedt een robuuste, stateful oplossing voor WhatsApp AI integratie met:

- ✅ Stateful feedback handling
- ✅ Verbeterde audio processing
- ✅ Enhanced error handling
- ✅ Draft management system
- ✅ Better user experience
- ✅ Production-ready features

Dit is de aanbevolen workflow voor productie gebruik in ZzpChat.

---

**Versie**: 2.0.0  
**Laatste update**: 2 januari 2025  
**Compatibiliteit**: n8n v1.0+, OpenAI API v1.0+
