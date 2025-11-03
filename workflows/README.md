# n8n Workflow Import Instructions

## ZzpChat AI Assistant Workflow

This workflow provides a complete AI assistant integration for ZzpChat, enabling all business functionalities through n8n.

## Setup Instructions

### 1. Environment Variables

Set these environment variables in your n8n instance:

```
ZZPCHAT_API_URL=https://your-zzpchat-domain.com
N8N_API_KEY=your-service-account-api-key
```

### 2. Create Service Account

1. Log in to your ZzpChat instance
2. Navigate to `/dashboard/settings` (or use API endpoint `/api/service-accounts`)
3. Create a new service account with name "n8n-production"
4. Copy the API key (shown only once!)
5. Add the API key as `N8N_API_KEY` environment variable in n8n

### 3. Import Workflow

1. Open n8n
2. Click "Import from File" or "Import from URL"
3. Select `zzpchat-ai-assistant-workflow.json`
4. The workflow will be imported with all nodes

### 4. Configure Webhook

1. Click on the "Webhook" node
2. Copy the webhook URL
3. Use this URL in your ZzpChat application to trigger workflows

## Available Actions

### create_invoice
Creates a new invoice for a client.

**Parameters:**
- `clientId` (required): UUID of the client
- `description` (optional): Invoice description
- `dueDate` (optional): ISO date string
- `lineItems` (optional): Array of line items
- `taxRate` (optional): Default 21.0

**Example:**
```json
{
  "action": "create_invoice",
  "parameters": {
    "clientId": "uuid-here",
    "description": "Website development",
    "lineItems": [
      {
        "description": "Development hours",
        "quantity": 10,
        "rate": 75,
        "amount": 750
      }
    ]
  },
  "userId": "user-uuid"
}
```

### create_quote
Creates a new quote/offerte.

**Parameters:**
- `clientId` (required): UUID of the client
- `description` (optional): Quote description
- `validUntil` (optional): ISO date string (defaults to 30 days)
- `lineItems` (optional): Array of line items
- `taxRate` (optional): Default 21.0

### add_time_entry
Adds a time entry for urenregistratie.

**Parameters:**
- `project` (required): Project name
- `hours` (required): Number of hours
- `date` (optional): ISO date string (defaults to today)
- `notes` (optional): Notes
- `clientId` (optional): UUID of the client
- `billable` (optional): Boolean, defaults to true

### add_kilometer
Adds a kilometer entry for kilometerregistratie.

**Parameters:**
- `fromLocation` (required): Starting location
- `toLocation` (required): Destination location
- `distanceKm` (required): Distance in kilometers
- `purpose` (required): Purpose of trip
- `date` (optional): ISO date string (defaults to today)
- `type` (optional): "zakelijk" or "privé", defaults to "zakelijk"
- `isBillable` (optional): Boolean, defaults to true
- `clientId` (optional): UUID of the client
- `projectId` (optional): UUID of the project

### create_contact
Creates a new contact/client.

**Parameters:**
- `name` (required): Contact name
- `email` (optional): Email address
- `phone` (optional): Phone number
- `company` (optional): Company name
- `position` (optional): Position
- `notes` (optional): Notes
- `tags` (optional): Array of tags

### search_contacts
Searches for contacts.

**Parameters:**
- `search` (optional): Search query
- `tag` (optional): Filter by tag

### get_invoices
Retrieves invoices with optional filtering.

**Parameters:**
- `status` (optional): Filter by status (DRAFT, SENT, PAID, etc.)
- `clientId` (optional): Filter by client
- `page` (optional): Page number, defaults to 1
- `limit` (optional): Items per page, defaults to 10

### get_quotes
Retrieves quotes with optional filtering.

**Parameters:**
- `status` (optional): Filter by status (DRAFT, SENT, ACCEPTED, etc.)
- `clientId` (optional): Filter by client
- `page` (optional): Page number, defaults to 1
- `limit` (optional): Items per page, defaults to 10

### ai_intent
Analyzes user message for intent and generates AI response.

**Parameters:**
- `message` (required): User message
- `conversationHistory` (optional): Array of previous messages

### context_search
Searches across clients, invoices, quotes, and time entries.

**Parameters:**
- `query` (required): Search query

## Testing

Use the test endpoint to verify connectivity:

```bash
curl -X GET "https://your-zzpchat-domain.com/api/test/n8n" \
  -H "X-API-Key: your-api-key" \
  -H "X-User-Id: user-uuid"
```

## Response Format

All actions return a standardized response:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed successfully",
  "context": {
    "userId": "user-uuid",
    "userName": "User Name",
    "action": "create_invoice"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Failed to execute action",
  "context": {
    "userId": "user-uuid",
    "action": "create_invoice"
  }
}
```

## Security

- All requests require API key authentication
- User ID must be provided for each request
- Service accounts can be bound to specific users
- All data is isolated per user

## Troubleshooting

### 401 Unauthorized
- Check that API key is correct
- Verify API key is active in service account settings

### 400 Bad Request
- Verify userId is provided
- Check that all required parameters are included
- Validate parameter formats (dates, UUIDs, etc.)

### Rate Limiting
- Check service account rate limit settings
- Wait for rate limit reset or contact administrator

