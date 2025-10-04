# ZzpChat - AI Assistant voor ZZP'ers

Een moderne webapplicatie die ZZP'ers helpt met administratie via WhatsApp AI-integratie.

## Features

- 🤖 **AI Assistant** - Automatische verwerking van WhatsApp berichten
- 📄 **Factuur Beheer** - Creëer, verstuur en beheer facturen
- 💼 **Offerte Systeem** - Maak professionele offertes
- ⏰ **Urenregistratie** - Houd bij hoeveel uren je werkt
- 👥 **Klantenbeheer** - Centraal overzicht van al je klanten
- 💳 **Mollie Integratie** - Nederlandse betaalmethoden (iDEAL, SEPA)
- 🔗 **n8n Workflows** - Automatisering van bedrijfsprocessen
- 📧 **Email Integraties** - Gmail en Outlook synchronisatie

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Mollie API
- **AI**: OpenAI GPT-4
- **Automation**: n8n
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Mollie account
- OpenAI API key
- WhatsApp Business API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ZzpChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Random 32+ character string
   - `MOLLIE_API_KEY` - Your Mollie API key
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API token

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with: `test@zzpchat.nl` / `test123`

## Deployment to Vercel

### 1. Prepare for Production

1. **Set up production database**
   - Create a PostgreSQL database (e.g., on Supabase, PlanetScale, or Railway)
   - Update `DATABASE_URL` in your environment variables

2. **Configure environment variables in Vercel**
   - Go to your Vercel project settings
   - Add all environment variables from `env.example`
   - Make sure to use production URLs and keys

### 2. Deploy

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set up database**
   ```bash
   vercel env pull .env.local
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### 3. Post-Deployment Setup

1. **Configure webhooks**
   - WhatsApp webhook: `https://your-domain.com/api/webhooks/whatsapp`
   - Mollie webhook: `https://your-domain.com/api/webhooks/mollie`
   - n8n webhook: `https://your-domain.com/api/webhooks/n8n`

2. **Set up n8n workflows**
   - Deploy n8n instance (self-hosted or n8n Cloud)
   - Import workflow templates from `/workflows` folder
   - Configure webhook URLs and API keys

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Quotes
- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create new quote

### Time Entries
- `GET /api/time-entries` - List all time entries
- `POST /api/time-entries` - Create new time entry

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp webhook
- `POST /api/webhooks/mollie` - Mollie payment webhook
- `POST /api/webhooks/n8n` - n8n automation webhook

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User** - User accounts with subscription tiers
- **Client** - Customer information
- **Invoice** - Invoice management with line items
- **Quote** - Quote/proposal system
- **TimeEntry** - Time tracking
- **Integration** - OAuth integrations (Gmail, Outlook)
- **AI_Conversation** - WhatsApp AI conversation history

## n8n Workflows

The application uses n8n for automation:

1. **WhatsApp Message Processing**
   - Receives WhatsApp messages
   - Processes with OpenAI
   - Creates invoices/quotes automatically
   - Sends responses back to WhatsApp

2. **Email Notifications**
   - Sends invoice/quote emails
   - Payment confirmations
   - Reminders and follow-ups

3. **Calendar Integration**
   - Syncs appointments
   - Meeting reminders
   - Time blocking

## Security

- All API endpoints require authentication
- Passwords are hashed with bcrypt
- Environment variables for sensitive data
- CORS protection
- Rate limiting (TODO)
- Input validation with Zod

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@zzpchat.nl or create an issue in the repository.
