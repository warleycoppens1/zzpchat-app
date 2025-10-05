<<<<<<< HEAD
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
=======
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
>>>>>>> b63cdcc67c1a46bf1c0f9df1030e2ca004e3c5ff
# Deployment trigger
# Deployment fix - Sun Oct  5 12:54:56 CEST 2025
