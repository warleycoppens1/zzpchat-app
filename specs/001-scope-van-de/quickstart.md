# Quickstart Guide: ZzpChat MVP

## Overview
This guide demonstrates the core user journey of ZzpChat MVP - from registration to using the WhatsApp AI assistant for administrative tasks.

## Prerequisites
- Node.js 20+ installed
- PostgreSQL database running
- WhatsApp Business API access
- OpenAI API key
- Google OAuth credentials (for Gmail/Calendar integration)

## Setup Steps

### 1. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd zzpchat

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your API keys and database URL
```

### 2. Database Setup
```bash
# Run database migrations
npx prisma migrate dev

# Seed development data
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run dev
```

## User Journey Test

### Step 1: User Registration
1. Navigate to `http://localhost:3000`
2. Click "Registreren" button
3. Fill in registration form:
   - Email: `test@example.com`
   - Name: `Test User`
   - Company: `Test Company`
   - Password: `password123`
4. Click "Account aanmaken"
5. **Expected**: User redirected to dashboard with welcome message

### Step 2: WhatsApp Integration Setup
1. In dashboard, navigate to "WhatsApp Setup"
2. Click "Koppel WhatsApp Business"
3. Follow OAuth flow to connect WhatsApp Business account
4. **Expected**: Status shows "Verbonden" with phone number

### Step 3: Client Creation
1. Navigate to "Instellingen" → "Klanten"
2. Click "Nieuwe klant"
3. Fill in client details:
   - Name: `Jan Jansen`
   - Email: `jan@example.com`
   - Company: `Jansen BV`
4. Click "Opslaan"
5. **Expected**: Client appears in clients list

### Step 4: AI Assistant Test - Create Invoice
1. Send WhatsApp message to connected business number:
   ```
   Maak factuur van €500 voor Jan Jansen
   ```
2. **Expected AI Response**: 
   ```
   Ik ga een factuur maken van €500 voor Jan Jansen. 
   Factuur #INV-001 is aangemaakt in je dashboard.
   ```
3. Navigate to "Facturen" in dashboard
4. **Expected**: New invoice visible with status "DRAFT"

### Step 5: AI Assistant Test - Time Tracking
1. Send WhatsApp message:
   ```
   Voeg 5 uren toe voor project "Website ontwikkeling" voor Jan Jansen
   ```
2. **Expected AI Response**:
   ```
   5 uren toegevoegd voor project "Website ontwikkeling" voor Jan Jansen.
   ```
3. Navigate to "Urenregistratie"
4. **Expected**: New time entry visible

### Step 6: Email Integration Test
1. Navigate to "Integraties"
2. Click "Koppel Gmail"
3. Complete OAuth flow
4. Send WhatsApp message:
   ```
   Geef me een samenvatting van mijn inkomende mails
   ```
5. **Expected AI Response**:
   ```
   Hier is een samenvatting van je inkomende mails:
   - 2 nieuwe e-mails van klanten
   - 1 factuur herinnering
   - 3 marketing e-mails
   ```

### Step 7: Calendar Integration Test
1. In "Integraties", click "Koppel Google Calendar"
2. Complete OAuth flow
3. Send WhatsApp message:
   ```
   Wat zijn mijn afspraken morgen?
   ```
4. **Expected AI Response**:
   ```
   Je hebt de volgende afspraken morgen:
   - 10:00 - Meeting met Jan Jansen
   - 14:00 - Project review
   ```

## API Testing

### Authentication Test
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Dashboard Stats Test
```bash
# Get dashboard statistics (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer TOKEN"
```

### AI Message Processing Test
```bash
# Process WhatsApp message
curl -X POST http://localhost:3000/api/ai/process-message \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Maak factuur van €500 voor Jan Jansen","messageType":"text"}'
```

## Success Criteria

### Functional Requirements
- ✅ User can register and log in
- ✅ WhatsApp Business account can be connected
- ✅ AI assistant processes natural language commands
- ✅ Invoices are created from WhatsApp messages
- ✅ Time entries are added from WhatsApp messages
- ✅ Email summaries are generated
- ✅ Calendar information is retrieved
- ✅ Dashboard shows statistics and recent activity

### Performance Requirements
- ✅ WhatsApp message processing < 2 seconds
- ✅ Dashboard page load < 1 second
- ✅ AI response time < 3 seconds

### Security Requirements
- ✅ User authentication works
- ✅ API endpoints require authentication
- ✅ Sensitive data is encrypted
- ✅ WhatsApp webhook signature verification

## Troubleshooting

### Common Issues
1. **WhatsApp not connecting**: Check API credentials and webhook URL
2. **AI not responding**: Verify OpenAI API key and rate limits
3. **Database errors**: Ensure PostgreSQL is running and migrations applied
4. **OAuth failures**: Check Google OAuth configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

### Database Reset
```bash
# Reset database (development only)
npx prisma migrate reset
npx prisma db seed
```

## Next Steps
After successful quickstart validation:
1. Run full test suite: `npm test`
2. Deploy to staging environment
3. Conduct user acceptance testing
4. Prepare for production deployment
