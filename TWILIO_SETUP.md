# Twilio WhatsApp Setup Guide

Deze guide helpt je bij het opzetten van Twilio WhatsApp integratie voor ZzpChat.

## Vereisten

1. **Twilio Account**: Maak een account op [twilio.com](https://www.twilio.com)
2. **WhatsApp Business API**: Request toegang tot Twilio's WhatsApp Business API
3. **Environment Variables**: Configureer de benodigde variabelen

## Stap 1: Twilio Account Setup

### 1.1 Account aanmaken
1. Ga naar [twilio.com/signup](https://www.twilio.com/try-twilio)
2. Maak een gratis account aan (trial account beschikbaar)
3. Verifieer je telefoonnummer en e-mailadres

### 1.2 Account SID en Auth Token ophalen
1. Log in op je Twilio Console
2. Ga naar **Account** → **Settings** → **General**
3. Kopieer je **Account SID** en **Auth Token**
4. Bewaar deze veilig (Auth Token wordt slechts één keer getoond)

## Stap 2: WhatsApp Business API Access

### 2.1 WhatsApp Sandbox (voor ontwikkeling)
Twilio biedt een WhatsApp Sandbox voor testing zonder goedkeuring:

1. Ga naar **Messaging** → **Try it out** → **Send a WhatsApp Message**
2. Volg de instructies om je telefoonnummer te verifiëren
3. Je krijgt een sandbox nummer in formaat: `whatsapp:+14155238886`
4. Test berichten versturen naar dit nummer

### 2.2 WhatsApp Business API (voor productie)
Voor productie gebruik moet je:

1. **WhatsApp Business Account aanmaken**:
   - Ga naar [Facebook Business Manager](https://business.facebook.com)
   - Maak een Business Account
   - Verifieer je business

2. **WhatsApp Business Profile aanmaken**:
   - Ga naar [business.facebook.com/settings](https://business.facebook.com/settings)
   - Klik op **WhatsApp Accounts**
   - Maak een nieuwe WhatsApp Business Account aan
   - Volg de verificatie stappen

3. **Twilio WhatsApp Sender Request**:
   - Ga naar Twilio Console → **Messaging** → **Settings** → **WhatsApp Senders**
   - Klik op **Request a WhatsApp Sender**
   - Vul je Business Account details in
   - Wacht op goedkeuring (kan enkele dagen duren)

4. **Phone Number Toewijzing**:
   - Na goedkeuring kun je een telefoonnummer toewijzen
   - Dit wordt je WhatsApp Business nummer

## Stap 3: Environment Variables Configureren

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM_NUMBER=whatsapp:+1234567890

# Optional: Webhook Security
TWILIO_VALIDATE_WEBHOOK=true

# Optional: SimAI Integration (if using)
SIMAI_WEBHOOK_URL=https://your-simai-webhook-url
SIMAI_API_KEY=your_simai_api_key
```

### Variabelen Uitleg

- **TWILIO_ACCOUNT_SID**: Je Twilio Account SID (begint met "AC")
- **TWILIO_AUTH_TOKEN**: Je Twilio Auth Token (houd dit geheim!)
- **TWILIO_WHATSAPP_FROM_NUMBER**: Je Twilio WhatsApp nummer in formaat `whatsapp:+1234567890`
  - Voor Sandbox: gebruik het sandbox nummer dat Twilio geeft
  - Voor Productie: gebruik je goedgekeurde WhatsApp Business nummer
- **TWILIO_VALIDATE_WEBHOOK**: Valideer Twilio webhook signatures (aanbevolen voor productie)

## Stap 4: Webhook Configuratie

### 4.1 Webhook URL Instellen
1. Ga naar Twilio Console → **Messaging** → **Settings** → **WhatsApp Sandbox** (of **WhatsApp Senders**)
2. Configureer de **When a message comes in** webhook:
   ```
   https://yourdomain.com/api/webhooks/twilio
   ```
3. Kies **HTTP POST** als method
4. Sla op

### 4.2 Webhook Security (Aanbevolen)
Voor productie, zorg dat `TWILIO_VALIDATE_WEBHOOK=true` staat. Dit valideert dat webhooks daadwerkelijk van Twilio komen.

## Stap 5: Testing

### 5.1 Test Bericht Versturen
Gebruik de Twilio Console om een test bericht te versturen:
1. Ga naar **Messaging** → **Try it out** → **Send a WhatsApp Message**
2. Selecteer je WhatsApp nummer
3. Voer een test nummer in
4. Verstuur een test bericht

### 5.2 Test via Code
```typescript
import { twilioWhatsAppService } from '@/lib/twilio-whatsapp'

// Test bericht versturen
const result = await twilioWhatsAppService.sendMessage(
  '+31612345678', // Ontvanger (zonder whatsapp: prefix)
  'Dit is een test bericht!'
)

console.log('Message sent:', result.sid)
```

### 5.3 Webhook Testen
1. Verstuur een bericht naar je Twilio WhatsApp nummer
2. Check de logs in je applicatie
3. Je zou moeten zien: `Twilio webhook received: {...}`

## Stap 6: Migratie van Meta WhatsApp

Als je al Meta WhatsApp gebruikt, kun je geleidelijk migreren:

### Optie 1: Beide Services Actief (Aanbevolen voor migratie)
- Houd beide services actief tijdens migratie
- Gebruik environment variable om te schakelen:
  ```env
  WHATSAPP_PROVIDER=twilio  # of 'meta'
  ```

### Optie 2: Directe Switch
- Update alle referenties naar Twilio service
- Test grondig voordat je Meta WhatsApp uitschakelt

## Troubleshooting

### Probleem: "Credentials not configured"
**Oplossing**: Check of alle Twilio environment variables correct zijn ingesteld

### Probleem: "Invalid phone number format"
**Oplossing**: Twilio verwacht nummers in formaat `whatsapp:+1234567890` (met landcode)

### Probleem: "Webhook signature validation failed"
**Oplossing**: 
- Check of `TWILIO_VALIDATE_WEBHOOK` correct is ingesteld
- Voor development, kun je dit op `false` zetten
- Voor productie, zorg dat de webhook URL correct is geconfigureerd

### Probleem: "Message not delivered"
**Oplossing**:
- Check of het ontvanger nummer WhatsApp heeft
- Voor Sandbox: voeg het nummer eerst toe aan je sandbox
- Voor Productie: check of het nummer niet geblokkeerd is

### Probleem: "Rate limit exceeded"
**Oplossing**: 
- Twilio heeft rate limits voor WhatsApp messages
- Sandbox: 100 messages/dag
- Productie: afhankelijk van je plan
- Implementeer rate limiting in je code

## Kosten

### Sandbox (Gratis)
- Gratis voor development en testing
- Beperkt aantal berichten per dag
- Alleen naar geverifieerde nummers

### Productie Pricing
- **Conversational Messages**: ~€0.005 per bericht (of regionale prijs)
- **Session Messages**: Initiatie kosten kunnen variëren
- Check [Twilio Pricing](https://www.twilio.com/whatsapp/pricing) voor actuele prijzen

## Beveiliging

### Best Practices
1. **Nooit commit credentials**: Gebruik environment variables
2. **Webhook validation**: Altijd aan voor productie
3. **Rate limiting**: Implementeer rate limiting in je applicatie
4. **Error handling**: Log errors maar expose geen gevoelige data

## Support

- **Twilio Docs**: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Twilio Support**: [support.twilio.com](https://support.twilio.com)
- **ZzpChat Issues**: Open een issue in de repository

## Migration Checklist

- [ ] Twilio account aangemaakt
- [ ] Account SID en Auth Token gekopieerd
- [ ] Environment variables geconfigureerd
- [ ] Webhook URL ingesteld in Twilio Console
- [ ] Test bericht succesvol verstuurd
- [ ] Webhook ontvangst getest
- [ ] Media handling getest (indien gebruikt)
- [ ] Audio transcription getest (indien gebruikt)
- [ ] Error handling geïmplementeerd
- [ ] Rate limiting geïmplementeerd
- [ ] Monitoring en logging ingesteld
- [ ] Productie WhatsApp Business API goedkeuring (indien productie)

---

**Laatste update**: 2025-01-29

