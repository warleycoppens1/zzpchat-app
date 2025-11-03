# WhatsApp Provider Migration Notes

## Overzicht

ZzpChat ondersteunt nu twee WhatsApp providers:
1. **Meta WhatsApp Business API** (standaard)
2. **Twilio WhatsApp API** (nieuwe optie)

## Provider Selectie

Selecteer de provider via environment variable:

```env
WHATSAPP_PROVIDER=meta    # of 'twilio'
```

Als niet opgegeven, default is `meta` voor backward compatibility.

## Unified Service

Er is een unified WhatsApp service beschikbaar (`lib/whatsapp-unified.ts`) die automatisch schakelt tussen providers:

```typescript
import { unifiedWhatsAppService } from '@/lib/whatsapp-unified'

// Werkt voor beide providers
await unifiedWhatsAppService.sendMessage('+31612345678', 'Hello!')
await unifiedWhatsAppService.sendAcknowledgment('+31612345678')
```

## Provider-specifieke Services

Je kunt ook direct de provider-specifieke services gebruiken:

### Meta WhatsApp
```typescript
import { whatsappService } from '@/lib/whatsapp'
```

### Twilio WhatsApp
```typescript
import { twilioWhatsAppService } from '@/lib/twilio-whatsapp'
```

## Migratie Strategie

### Optie 1: Geleidelijke Migratie (Aanbevolen)
1. Voeg Twilio configuratie toe aan `.env`
2. Test Twilio provider lokaal
3. Switch naar Twilio via `WHATSAPP_PROVIDER=twilio`
4. Houd Meta configuratie als backup

### Optie 2: Directe Switch
1. Update `WHATSAPP_PROVIDER=twilio`
2. Verwijder Meta environment variables (of houd als backup)
3. Test grondig

### Optie 3: Beide Actief (Development)
- Gebruik Meta voor development
- Gebruik Twilio voor staging/production
- Switch via environment variables per omgeving

## Webhook Endpoints

### Meta WhatsApp
```
POST /api/webhooks/whatsapp
GET /api/webhooks/whatsapp (verification)
```

### Twilio WhatsApp
```
POST /api/webhooks/twilio
GET /api/webhooks/twilio (health check)
```

Beide endpoints kunnen naast elkaar bestaan. Configureer de juiste webhook URL in de respectievelijke provider consoles.

## Verschillen tussen Providers

### Meta WhatsApp
- Gebruikt Graph API
- Media via media IDs
- Template messages vereist voor marketing
- Betere integratie met Facebook Business Manager

### Twilio WhatsApp
- Eenvoudigere API
- Media via URLs
- Flexibeler voor conversational messaging
- Betere developer experience
- Eenvoudigere setup voor development

## Backward Compatibility

Alle bestaande code die `whatsappService` gebruikt blijft werken wanneer `WHATSAPP_PROVIDER=meta` (default).

Voor nieuwe implementaties, gebruik `unifiedWhatsAppService` voor maximale flexibiliteit.

## Testing

Test beide providers tijdens migratie:

```typescript
// Test Meta
process.env.WHATSAPP_PROVIDER = 'meta'
const metaResult = await unifiedWhatsAppService.sendMessage(...)

// Test Twilio  
process.env.WHATSAPP_PROVIDER = 'twilio'
const twilioResult = await unifiedWhatsAppService.sendMessage(...)
```

## Rollback Plan

Bij problemen met Twilio:
1. Set `WHATSAPP_PROVIDER=meta` terug
2. Herstart applicatie
3. Meta WhatsApp werkt direct weer

## Support

- **Meta WhatsApp**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Twilio WhatsApp**: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **ZzpChat Issues**: Open een issue in de repository

---

**Laatste update**: 2025-01-29

