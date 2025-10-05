# Data Model: ZzpChat MVP

## Entity Definitions

### User
**Purpose**: Represents a ZZP'er using the application
**Fields**:
- `id`: string (UUID, primary key)
- `email`: string (unique, required)
- `name`: string (required)
- `companyName`: string (optional)
- `subscriptionTier`: enum (STARTER, PRO, BUSINESS)
- `whatsappPhoneNumber`: string (optional, for WhatsApp integration)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- One-to-many: Invoices, Quotes, TimeEntries, Integrations, Clients

**Validation Rules**:
- Email must be valid format and unique
- Subscription tier must be valid enum value
- WhatsApp phone number must be valid international format when provided

### Client
**Purpose**: Represents customers of the ZZP'er
**Fields**:
- `id`: string (UUID, primary key)
- `name`: string (required)
- `email`: string (optional)
- `company`: string (optional)
- `phone`: string (optional)
- `address`: string (optional)
- `vatNumber`: string (optional)
- `userId`: string (foreign key to User)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner)
- One-to-many: Invoices, Quotes, TimeEntries

**Validation Rules**:
- Name is required
- Email must be valid format when provided
- Phone must be valid format when provided
- VAT number must be valid Dutch format when provided

### Invoice
**Purpose**: Represents bills sent to clients
**Fields**:
- `id`: string (UUID, primary key)
- `number`: string (unique per user, required)
- `amount`: Decimal (required, > 0)
- `status`: enum (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `clientId`: string (foreign key to Client)
- `userId`: string (foreign key to User)
- `dueDate`: DateTime (optional)
- `sentAt`: DateTime (optional)
- `paidAt`: DateTime (optional)
- `description`: string (optional)
- `lineItems`: JSON (array of line items with description, quantity, price)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner), Client (recipient)

**Validation Rules**:
- Number must be unique per user
- Amount must be positive
- Status must be valid enum value
- Due date must be in future when set

**State Transitions**:
- DRAFT → SENT (when invoice is sent)
- SENT → PAID (when payment received)
- SENT → OVERDUE (when due date passed)
- Any → CANCELLED (when cancelled)

### Quote
**Purpose**: Represents proposals sent to clients
**Fields**:
- `id`: string (UUID, primary key)
- `number`: string (unique per user, required)
- `amount`: Decimal (required, > 0)
- `status`: enum (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
- `clientId`: string (foreign key to Client)
- `userId`: string (foreign key to User)
- `validUntil`: DateTime (optional)
- `sentAt`: DateTime (optional)
- `acceptedAt`: DateTime (optional)
- `description`: string (optional)
- `lineItems`: JSON (array of line items with description, quantity, price)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner), Client (recipient)

**Validation Rules**:
- Number must be unique per user
- Amount must be positive
- Status must be valid enum value
- Valid until date must be in future when set

**State Transitions**:
- DRAFT → SENT (when quote is sent)
- SENT → ACCEPTED (when client accepts)
- SENT → REJECTED (when client rejects)
- SENT → EXPIRED (when valid until date passed)

### TimeEntry
**Purpose**: Represents logged work hours
**Fields**:
- `id`: string (UUID, primary key)
- `project`: string (required)
- `hours`: Decimal (required, > 0)
- `date`: Date (required)
- `notes`: string (optional)
- `clientId`: string (foreign key to Client, optional)
- `userId`: string (foreign key to User)
- `invoiceId`: string (foreign key to Invoice, optional)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner), Client (optional), Invoice (when billed)

**Validation Rules**:
- Project name is required
- Hours must be positive
- Date cannot be in the future
- Client must exist when provided

### Integration
**Purpose**: Represents external service connections
**Fields**:
- `id`: string (UUID, primary key)
- `type`: enum (WHATSAPP, GMAIL, GOOGLE_CALENDAR, GOOGLE_DRIVE, OUTLOOK_MAIL, OUTLOOK_CALENDAR)
- `status`: enum (CONNECTING, CONNECTED, DISCONNECTED, ERROR)
- `credentials`: string (encrypted OAuth tokens or API keys)
- `userId`: string (foreign key to User)
- `lastSync`: DateTime (optional)
- `errorMessage`: string (optional)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner)

**Validation Rules**:
- Type must be valid enum value
- Status must be valid enum value
- Credentials must be encrypted when stored
- User can only have one integration per type

### AI_Conversation
**Purpose**: Represents WhatsApp conversation history and AI processing results
**Fields**:
- `id`: string (UUID, primary key)
- `userId`: string (foreign key to User)
- `whatsappMessageId`: string (optional, for tracking)
- `userMessage`: string (required)
- `aiResponse`: string (optional)
- `actionType`: enum (CREATE_INVOICE, CREATE_QUOTE, ADD_TIME, SUMMARIZE_EMAILS, MANAGE_CALENDAR, UNKNOWN)
- `actionData`: JSON (optional, structured data for the action)
- `status`: enum (PROCESSING, COMPLETED, ERROR)
- `errorMessage`: string (optional)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Relationships**:
- Many-to-one: User (owner)

**Validation Rules**:
- User message is required
- Action type must be valid enum value
- Status must be valid enum value

## Database Schema (Prisma)

```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  name                String
  companyName         String?
  subscriptionTier    SubscriptionTier @default(STARTER)
  whatsappPhoneNumber String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relationships
  clients             Client[]
  invoices            Invoice[]
  quotes              Quote[]
  timeEntries         TimeEntry[]
  integrations        Integration[]
  conversations       AI_Conversation[]

  @@map("users")
}

model Client {
  id        String   @id @default(uuid())
  name      String
  email     String?
  company   String?
  phone     String?
  address   String?
  vatNumber String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices  Invoice[]
  quotes    Quote[]
  timeEntries TimeEntry[]

  @@map("clients")
}

model Invoice {
  id          String        @id @default(uuid())
  number      String
  amount      Decimal
  status      InvoiceStatus @default(DRAFT)
  clientId    String
  userId      String
  dueDate     DateTime?
  sentAt      DateTime?
  paidAt      DateTime?
  description String?
  lineItems   Json?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relationships
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  client      Client      @relation(fields: [clientId], references: [id])
  timeEntries TimeEntry[]

  @@unique([number, userId])
  @@map("invoices")
}

model Quote {
  id          String      @id @default(uuid())
  number      String
  amount      Decimal
  status      QuoteStatus @default(DRAFT)
  clientId    String
  userId      String
  validUntil  DateTime?
  sentAt      DateTime?
  acceptedAt  DateTime?
  description String?
  lineItems   Json?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relationships
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  client      Client @relation(fields: [clientId], references: [id])

  @@unique([number, userId])
  @@map("quotes")
}

model TimeEntry {
  id        String   @id @default(uuid())
  project   String
  hours     Decimal
  date      DateTime @db.Date
  notes     String?
  clientId  String?
  userId    String
  invoiceId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  client    Client?  @relation(fields: [clientId], references: [id])
  invoice   Invoice? @relation(fields: [invoiceId], references: [id])

  @@map("time_entries")
}

model Integration {
  id           String           @id @default(uuid())
  type         IntegrationType
  status       IntegrationStatus @default(CONNECTING)
  credentials  String           // Encrypted
  userId       String
  lastSync     DateTime?
  errorMessage String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  // Relationships
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([type, userId])
  @@map("integrations")
}

model AI_Conversation {
  id                String          @id @default(uuid())
  userId            String
  whatsappMessageId String?
  userMessage       String
  aiResponse        String?
  actionType        ActionType?
  actionData        Json?
  status            ConversationStatus @default(PROCESSING)
  errorMessage      String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relationships
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ai_conversations")
}

// Enums
enum SubscriptionTier {
  STARTER
  PRO
  BUSINESS
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

enum IntegrationType {
  WHATSAPP
  GMAIL
  GOOGLE_CALENDAR
  GOOGLE_DRIVE
  OUTLOOK_MAIL
  OUTLOOK_CALENDAR
}

enum IntegrationStatus {
  CONNECTING
  CONNECTED
  DISCONNECTED
  ERROR
}

enum ActionType {
  CREATE_INVOICE
  CREATE_QUOTE
  ADD_TIME
  SUMMARIZE_EMAILS
  MANAGE_CALENDAR
  UNKNOWN
}

enum ConversationStatus {
  PROCESSING
  COMPLETED
  ERROR
}
```

## Indexes and Constraints

### Performance Indexes
- `User.email` (unique index)
- `Invoice.number + userId` (unique composite index)
- `Quote.number + userId` (unique composite index)
- `TimeEntry.date` (for date range queries)
- `AI_Conversation.createdAt` (for conversation history)
- `Integration.type + userId` (unique composite index)

### Data Integrity
- Foreign key constraints with cascade delete for user data
- Check constraints for positive amounts and hours
- Unique constraints for invoice/quote numbers per user
- Encryption requirements for sensitive credential data
