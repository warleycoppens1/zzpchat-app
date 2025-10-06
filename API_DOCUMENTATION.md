# ZzpChat API Documentation

## Overview

De ZzpChat API biedt endpoints voor het beheren van offers (offertes) en contacts (contacten) voor ZZP'ers.

## Authentication

Alle API endpoints vereisen authenticatie via NextAuth.js. Voeg de volgende header toe aan je requests:

```
Authorization: Bearer <your-jwt-token>
```

## Offers API

### GET /api/offers

Haal alle offers op voor de geauthenticeerde gebruiker.

**Query Parameters:**
- `status` (optional): Filter op status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
- `clientId` (optional): Filter op client ID

**Response:**
```json
{
  "offers": [
    {
      "id": "uuid",
      "number": "OFF-2025-001",
      "amount": 1500.00,
      "status": "DRAFT",
      "description": "Website ontwikkeling",
      "notes": "Extra notities",
      "validUntil": "2025-02-01T00:00:00.000Z",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z",
      "client": {
        "id": "uuid",
        "name": "Client Naam",
        "email": "client@example.com",
        "company": "Bedrijf B.V."
      }
    }
  ]
}
```

### POST /api/offers

Maak een nieuwe offer aan.

**Request Body:**
```json
{
  "client": "client-uuid",
  "amount": 1500.00,
  "description": "Website ontwikkeling",
  "validUntil": "2025-02-01T00:00:00.000Z",
  "status": "DRAFT",
  "notes": "Extra notities"
}
```

**Response:**
```json
{
  "offer": {
    "id": "uuid",
    "number": "OFF-2025-001",
    "amount": 1500.00,
    "status": "DRAFT",
    "description": "Website ontwikkeling",
    "notes": "Extra notities",
    "validUntil": "2025-02-01T00:00:00.000Z",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "client": {
      "id": "uuid",
      "name": "Client Naam",
      "email": "client@example.com",
      "company": "Bedrijf B.V."
    }
  }
}
```

### GET /api/offers/[id]

Haal een specifieke offer op.

**Response:**
```json
{
  "offer": {
    "id": "uuid",
    "number": "OFF-2025-001",
    "amount": 1500.00,
    "status": "DRAFT",
    "description": "Website ontwikkeling",
    "notes": "Extra notities",
    "validUntil": "2025-02-01T00:00:00.000Z",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "client": {
      "id": "uuid",
      "name": "Client Naam",
      "email": "client@example.com",
      "company": "Bedrijf B.V."
    }
  }
}
```

### PUT /api/offers/[id]

Update een bestaande offer.

**Request Body:** (alle velden optioneel)
```json
{
  "client": "client-uuid",
  "amount": 1750.00,
  "description": "Website ontwikkeling + onderhoud",
  "status": "SENT",
  "notes": "Bijgewerkte notities"
}
```

### DELETE /api/offers/[id]

Verwijder een offer.

**Response:**
```json
{
  "message": "Offer deleted successfully"
}
```

## Contacts API

### GET /api/contacts

Haal alle contacten op voor de geauthenticeerde gebruiker.

**Query Parameters:**
- `search` (optional): Zoek in naam, email, bedrijf of telefoon
- `tag` (optional): Filter op tag

**Response:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "Jan de Vries",
      "email": "jan@example.com",
      "phone": "+31612345678",
      "company": "Bedrijf B.V.",
      "position": "Directeur",
      "address": "Straat 123, 1234 AB Amsterdam",
      "vatNumber": "NL123456789B01",
      "notes": "Belangrijke klant",
      "tags": ["vip", "website"],
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z",
      "_count": {
        "invoices": 5,
        "quotes": 3,
        "timeEntries": 12
      }
    }
  ]
}
```

### POST /api/contacts

Maak een nieuw contact aan.

**Request Body:**
```json
{
  "name": "Jan de Vries",
  "email": "jan@example.com",
  "phone": "+31612345678",
  "company": "Bedrijf B.V.",
  "position": "Directeur",
  "address": "Straat 123, 1234 AB Amsterdam",
  "vatNumber": "NL123456789B01",
  "notes": "Belangrijke klant",
  "tags": ["vip", "website"]
}
```

**Response:**
```json
{
  "contact": {
    "id": "uuid",
    "name": "Jan de Vries",
    "email": "jan@example.com",
    "phone": "+31612345678",
    "company": "Bedrijf B.V.",
    "position": "Directeur",
    "address": "Straat 123, 1234 AB Amsterdam",
    "vatNumber": "NL123456789B01",
    "notes": "Belangrijke klant",
    "tags": ["vip", "website"],
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "_count": {
      "invoices": 0,
      "quotes": 0,
      "timeEntries": 0
    }
  }
}
```

### GET /api/contacts/[id]

Haal een specifiek contact op met gerelateerde data.

**Response:**
```json
{
  "contact": {
    "id": "uuid",
    "name": "Jan de Vries",
    "email": "jan@example.com",
    "phone": "+31612345678",
    "company": "Bedrijf B.V.",
    "position": "Directeur",
    "address": "Straat 123, 1234 AB Amsterdam",
    "vatNumber": "NL123456789B01",
    "notes": "Belangrijke klant",
    "tags": ["vip", "website"],
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "_count": {
      "invoices": 5,
      "quotes": 3,
      "timeEntries": 12
    },
    "invoices": [
      {
        "id": "uuid",
        "number": "INV-2025-001",
        "amount": 1500.00,
        "status": "PAID",
        "dueDate": "2025-02-01T00:00:00.000Z",
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ],
    "quotes": [
      {
        "id": "uuid",
        "amount": 2000.00,
        "status": "ACCEPTED",
        "validUntil": "2025-02-01T00:00:00.000Z",
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### PUT /api/contacts/[id]

Update een bestaand contact.

**Request Body:** (alle velden optioneel)
```json
{
  "name": "Jan de Vries",
  "email": "jan@example.com",
  "phone": "+31612345678",
  "company": "Bedrijf B.V.",
  "position": "Directeur",
  "address": "Straat 123, 1234 AB Amsterdam",
  "vatNumber": "NL123456789B01",
  "notes": "Bijgewerkte notities",
  "tags": ["vip", "website", "urgent"]
}
```

### DELETE /api/contacts/[id]

Verwijder een contact (alleen als er geen gerelateerde data is).

**Response:**
```json
{
  "message": "Contact deleted successfully"
}
```

**Error Response (als er gerelateerde data is):**
```json
{
  "error": "Cannot delete contact with associated invoices, quotes, or time entries. Please remove these first."
}
```

## Error Handling

Alle endpoints gebruiken consistente error handling:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Not authenticated"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## SimAI Integration

Deze API endpoints zijn geïntegreerd in de SimAI WhatsApp AI Assistant workflow:

- **User Resolution**: `POST /api/users/resolve-by-phone` - Gebruiker zoeken op telefoonnummer
- **Draft Management**: `GET /api/drafts/pending`, `POST /api/drafts/store`, `POST /api/drafts/update`
- **Context Search**: `POST /api/context/search` - Zoeken in klantgegevens voor context
- **Audio Processing**: `POST /api/whatsapp/audio/transcribe` - Spraak-naar-tekst conversie

De workflow gebruikt de volgende environment variables:
- `ZZPCHAT_API_URL`: De base URL van je ZzpChat API
- `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp Phone Number ID
- `WHATSAPP_TOKEN`: WhatsApp Access Token
