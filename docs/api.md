# API Surface Overview

All endpoints live under `/api` inside the Next.js App Router. Every handler should:
- Validate authentication (via `getServerSession` or service tokens)
- Validate input with Zod or manual guards
- Delegate heavy lifting to helpers in `lib/`
- Return JSON responses with consistent shapes (`{ success, data, error }`)

## Authentication & Users
| Method | Route | Description |
| --- | --- | --- |
| `GET`/`POST` | `/api/auth/[...nextauth]` | NextAuth callbacks & session management |
| `POST` | `/api/auth/register` | Email/password registration |
| `POST` | `/api/auth/service-key` | Service-account authentication |
| `POST` | `/api/auth/setup-test-user` | Seeds a demo user for local testing |
| `POST` | `/api/users/resolve-by-phone` | Resolve user by WhatsApp phone number |

## Business Entities
| Method | Route | Description |
| --- | --- | --- |
| `GET/POST` | `/api/clients` | Client management |
| `GET/PUT/DELETE` | `/api/clients/[id]` | Single client operations |
| `GET/POST` | `/api/contacts` | Contact directory |
| `GET/PUT/DELETE` | `/api/contacts/[id]` | Single contact operations |
| `GET/POST` | `/api/invoices` | Invoice CRUD + status updates |
| `GET/PUT/DELETE` | `/api/invoices/[id]` | Invoice detail management |
| `POST` | `/api/invoices/preview/pdf` | Generate invoice PDF via Puppeteer |
| `GET/POST` | `/api/quotes` | Quote CRUD |
| `GET/PUT/DELETE` | `/api/quotes/[id]` | Quote detail |
| `POST` | `/api/quotes/preview/pdf` | Generate quote PDF |
| `GET/POST` | `/api/time-entries` | Hour tracking |
| `POST` | `/api/kilometers` | Mileage tracking |

## AI & Automation
| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/ai/chat` | Core AI assistant endpoint |
| `POST` | `/api/ai/browser` | Browser automation executor |
| `POST` | `/api/context/search` | RAG context retrieval |
| `POST` | `/api/conversations` | Store AI conversation state |
| `POST` | `/api/conversations/cleanup` | Remove stale conversations |
| `POST` | `/api/rag/reindex` | Trigger embedding + indexing cycle |

## Documents & Files
| Method | Route | Description |
| --- | --- | --- |
| `GET/POST` | `/api/documents` | Document listing & upload metadata |
| `POST` | `/api/documents/upload` | Upload document binary |
| `POST` | `/api/documents/export` | Export combined documents |
| `DELETE` | `/api/documents/[id]` | Remove a document |
| `POST` | `/api/files/upload` | General file upload |
| `POST` | `/api/files/cleanup` | Remove expired uploads |

## Integrations & Webhooks
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/integrations/status` | Integration health summary |
| `POST` | `/api/integrations/[provider]/connect` | OAuth hand-off |
| `POST` | `/api/integrations/[provider]/disconnect` | Remove stored credentials |
| `POST` | `/api/webhooks/whatsapp` | WhatsApp inbound webhook |
| `POST` | `/api/webhooks/mollie` | Payment status updates |
| `POST` | `/api/webhooks/n8n` | Automation callbacks |

## Analytics & Dashboard Data
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard/stats` | Dashboard metrics |
| `GET` | `/api/analytics/revenue` | Revenue charts |
| `GET` | `/api/analytics/invoices` | Invoice analytics |
| `GET` | `/api/analytics/time-tracking` | Time tracking insights |

## Automation & Cron
| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/cron/run-automations` | Kicks off automation engine (cron trigger) |
| `POST` | `/api/automations` | Create new automations |
| `GET/PUT/DELETE` | `/api/automations/[id]` | Manage automation instances |

> Add new endpoints by extending this table. Lead with the directory path, expected authentication, and important query/body parameters.
