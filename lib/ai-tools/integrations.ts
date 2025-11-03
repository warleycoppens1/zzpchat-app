/**
 * AI Tool Definitions for Integrations
 * Defines tools that the AI can use to interact with external services
 */

export interface AITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required: string[]
    }
  }
}

/**
 * Get all available integration tools for OpenAI Function Calling
 */
export function getIntegrationTools(userId: string): AITool[] {
  return [
    // Gmail Tools
    {
      type: 'function',
      function: {
        name: 'gmail_search_emails',
        description: 'Zoek naar e-mails in Gmail inbox. Kan gebruikt worden om e-mails te vinden op basis van zoekterm, afzender, of andere criteria.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Zoekterm voor e-mails (bijv. "from:client@example.com", "subject:factuur", of gewoon tekst)'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'gmail_get_unread',
        description: 'Haal ongelezen e-mails op uit Gmail inbox.',
        parameters: {
          type: 'object',
          properties: {
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 10)',
              default: 10
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'gmail_send_email',
        description: 'Verstuur een e-mail via Gmail.',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'E-mailadres van ontvanger'
            },
            subject: {
              type: 'string',
              description: 'Onderwerp van de e-mail'
            },
            body: {
              type: 'string',
              description: 'Inhoud van de e-mail (HTML ondersteund)'
            }
          },
          required: ['to', 'subject', 'body']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'gmail_get_message',
        description: 'Haal een specifieke e-mail op via message ID.',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Gmail message ID'
            }
          },
          required: ['messageId']
        }
      }
    },
    // Google Drive Tools
    {
      type: 'function',
      function: {
        name: 'drive_search_files',
        description: 'Zoek naar bestanden in Google Drive op basis van naam of query.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Zoekterm voor bestandsnaam of inhoud'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'drive_list_files',
        description: 'Lijst alle bestanden in Google Drive (of in een specifieke map).',
        parameters: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description: 'Optionele map ID om in te zoeken'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 20)',
              default: 20
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'drive_upload_file',
        description: 'Upload een bestand naar Google Drive.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Naam van het bestand'
            },
            content: {
              type: 'string',
              description: 'Inhoud van het bestand (als tekst)'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type (bijv. "text/plain", "application/pdf")',
              default: 'text/plain'
            },
            parentFolderId: {
              type: 'string',
              description: 'Optionele map ID waar het bestand moet worden opgeslagen'
            }
          },
          required: ['name', 'content']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'drive_create_folder',
        description: 'Maak een nieuwe map aan in Google Drive.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Naam van de map'
            },
            parentFolderId: {
              type: 'string',
              description: 'Optionele parent map ID'
            }
          },
          required: ['name']
        }
      }
    },
    // Google Calendar Tools
    {
      type: 'function',
      function: {
        name: 'calendar_list_events',
        description: 'Haal kalender events op. Kan gefilterd worden op datum bereik.',
        parameters: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start datum in ISO format (YYYY-MM-DD)'
            },
            endDate: {
              type: 'string',
              description: 'Eind datum in ISO format (YYYY-MM-DD)'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 20)',
              default: 20
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'calendar_get_upcoming',
        description: 'Haal aankomende events op voor de komende dagen.',
        parameters: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Aantal dagen vooruit (standaard: 7)',
              default: 7
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'calendar_create_event',
        description: 'Maak een nieuw kalender event aan.',
        parameters: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Titel van het event'
            },
            description: {
              type: 'string',
              description: 'Beschrijving van het event'
            },
            start: {
              type: 'string',
              description: 'Start tijd in ISO format (YYYY-MM-DDTHH:mm:ss)'
            },
            end: {
              type: 'string',
              description: 'Eind tijd in ISO format (YYYY-MM-DDTHH:mm:ss)'
            },
            location: {
              type: 'string',
              description: 'Locatie van het event'
            },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lijst van e-mailadressen van deelnemers'
            }
          },
          required: ['summary', 'start', 'end']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'calendar_update_event',
        description: 'Update een bestaand kalender event.',
        parameters: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'ID van het event'
            },
            summary: {
              type: 'string',
              description: 'Nieuwe titel (optioneel)'
            },
            description: {
              type: 'string',
              description: 'Nieuwe beschrijving (optioneel)'
            },
            start: {
              type: 'string',
              description: 'Nieuwe start tijd in ISO format (optioneel)'
            },
            end: {
              type: 'string',
              description: 'Nieuwe eind tijd in ISO format (optioneel)'
            }
          },
          required: ['eventId']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'calendar_delete_event',
        description: 'Verwijder een kalender event.',
        parameters: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'ID van het event'
            }
          },
          required: ['eventId']
        }
      }
    },
    // Outlook Mail Tools (similar to Gmail)
    {
      type: 'function',
      function: {
        name: 'outlook_search_emails',
        description: 'Zoek naar e-mails in Outlook inbox.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Zoekterm voor e-mails'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'outlook_send_email',
        description: 'Verstuur een e-mail via Outlook.',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'E-mailadres van ontvanger'
            },
            subject: {
              type: 'string',
              description: 'Onderwerp van de e-mail'
            },
            body: {
              type: 'string',
              description: 'Inhoud van de e-mail'
            }
          },
          required: ['to', 'subject', 'body']
        }
      }
    },
    // Outlook Calendar Tools (similar to Google Calendar)
    {
      type: 'function',
      function: {
        name: 'outlook_list_events',
        description: 'Haal kalender events op uit Outlook.',
        parameters: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start datum in ISO format'
            },
            endDate: {
              type: 'string',
              description: 'Eind datum in ISO format'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum aantal resultaten (standaard: 20)',
              default: 20
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'outlook_create_event',
        description: 'Maak een nieuw kalender event aan in Outlook.',
        parameters: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              description: 'Titel van het event'
            },
            body: {
              type: 'string',
              description: 'Beschrijving van het event'
            },
            start: {
              type: 'string',
              description: 'Start tijd in ISO format'
            },
            end: {
              type: 'string',
              description: 'Eind tijd in ISO format'
            },
            location: {
              type: 'string',
              description: 'Locatie van het event'
            },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lijst van e-mailadressen'
            }
          },
          required: ['subject', 'start', 'end']
        }
      }
    },
    // Integration Status Tool
    {
      type: 'function',
      function: {
        name: 'check_integration_status',
        description: 'Controleer de status van een integratie (Gmail, Drive, Calendar, Outlook).',
        parameters: {
          type: 'object',
          properties: {
            integration: {
              type: 'string',
              description: 'Naam van de integratie (gmail, drive, calendar, outlook, outlook-calendar)',
              enum: ['gmail', 'drive', 'calendar', 'outlook', 'outlook-calendar']
            }
          },
          required: ['integration']
        }
      }
    },
    // Browser Automation Tools
    {
      type: 'function',
      function: {
        name: 'browser_navigate',
        description: 'Navigeer naar een website in de browser. Gebruik dit om toegang te krijgen tot externe websites en taken uit te voeren.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL van de website om naar te navigeren (bijv. "https://belastingdienst.nl" of "https://kvk.nl")'
            },
            screenshot: {
              type: 'boolean',
              description: 'Neem een screenshot na navigatie (standaard: false)',
              default: false
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconden (standaard: 30000)',
              default: 30000
            }
          },
          required: ['url']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'browser_click',
        description: 'Klik op een element op de huidige pagina. Gebruik CSS selectors zoals "#button", ".class", "button[type=submit]"',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector van het element om op te klikken (bijv. "#submit-button", ".login-btn", "button[type=submit]")'
            },
            screenshot: {
              type: 'boolean',
              description: 'Neem een screenshot na de klik (standaard: false)',
              default: false
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconden om te wachten tot element verschijnt (standaard: 10000)',
              default: 10000
            }
          },
          required: ['selector']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'browser_type',
        description: 'Type tekst in een invoerveld op de huidige pagina.',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector van het invoerveld (bijv. "#email", "input[name=username]", ".password-field")'
            },
            text: {
              type: 'string',
              description: 'Tekst om in te typen'
            },
            screenshot: {
              type: 'boolean',
              description: 'Neem een screenshot na het typen (standaard: false)',
              default: false
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconden om te wachten tot element verschijnt (standaard: 10000)',
              default: 10000
            }
          },
          required: ['selector', 'text']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'browser_screenshot',
        description: 'Neem een screenshot van de huidige pagina. Handig om te zien wat er op het scherm staat.',
        parameters: {
          type: 'object',
          properties: {
            fullPage: {
              type: 'boolean',
              description: 'Screenshot van de volledige pagina, niet alleen zichtbaar gebied (standaard: false)',
              default: false
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'browser_extract',
        description: 'Haal tekst of data op van elementen op de huidige pagina.',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector van elementen om data uit te halen (bijv. ".table-row", "#content", "div.price")'
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconden om te wachten tot element verschijnt (standaard: 10000)',
              default: 10000
            }
          },
          required: ['selector']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'browser_execute_sequence',
        description: 'Voer een reeks browser acties uit in één keer. Handig voor complexe workflows zoals inloggen, formulieren invullen, etc.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Start URL om naar te navigeren (optioneel als eerste actie navigeren is)'
            },
            actions: {
              type: 'array',
              description: 'Array van acties om uit te voeren',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['navigate', 'click', 'type', 'wait', 'select'],
                    description: 'Type actie'
                  },
                  selector: {
                    type: 'string',
                    description: 'CSS selector (voor click, type, select)'
                  },
                  url: {
                    type: 'string',
                    description: 'URL (voor navigate)'
                  },
                  text: {
                    type: 'string',
                    description: 'Tekst om in te typen (voor type)'
                  },
                  value: {
                    type: 'string',
                    description: 'Waarde om te selecteren (voor select)'
                  },
                  timeout: {
                    type: 'number',
                    description: 'Timeout in milliseconden'
                  }
                }
              }
            },
            screenshot: {
              type: 'boolean',
              description: 'Neem een screenshot na alle acties (standaard: false)',
              default: false
            }
          },
          required: ['actions']
        }
      }
    },
    // Client Management Tools
    {
      type: 'function',
      function: {
        name: 'list_clients',
        description: 'Haal een lijst op van alle klanten. Gebruik dit om klanten te zoeken of te bekijken.',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'create_client',
        description: 'Maak een nieuwe klant aan. Gebruik dit wanneer de gebruiker een nieuwe klant wil toevoegen.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Naam van de klant (verplicht)'
            },
            email: {
              type: 'string',
              description: 'E-mailadres van de klant (optioneel)'
            },
            company: {
              type: 'string',
              description: 'Bedrijfsnaam (optioneel)'
            },
            phone: {
              type: 'string',
              description: 'Telefoonnummer (optioneel)'
            },
            address: {
              type: 'string',
              description: 'Adres (optioneel)'
            }
          },
          required: ['name']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'search_clients',
        description: 'Zoek naar klanten op basis van naam, bedrijf of e-mail.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Zoekterm voor klantnaam, bedrijfsnaam of e-mail'
            }
          },
          required: ['query']
        }
      }
    },
    // Quote Management Tools
    {
      type: 'function',
      function: {
        name: 'list_quotes',
        description: 'Haal een lijst op van alle offertes. Kan gefilterd worden op status of klant.',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
              description: 'Filter op status (optioneel)'
            },
            clientId: {
              type: 'string',
              description: 'Filter op klant ID (optioneel)'
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'create_quote',
        description: 'Maak een nieuwe offerte aan. Gebruik dit wanneer de gebruiker een offerte wil maken.',
        parameters: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              description: 'ID van de klant (verplicht)'
            },
            description: {
              type: 'string',
              description: 'Beschrijving van de offerte (optioneel)'
            },
            lineItems: {
              type: 'array',
              description: 'Lijst van regelitems voor de offerte',
              items: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'Beschrijving van het item'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Aantal'
                  },
                  rate: {
                    type: 'number',
                    description: 'Tarief per eenheid'
                  },
                  amount: {
                    type: 'number',
                    description: 'Totaalbedrag (quantity * rate)'
                  }
                },
                required: ['description', 'quantity', 'rate', 'amount']
              }
            },
            validUntil: {
              type: 'string',
              description: 'Datum tot wanneer de offerte geldig is (YYYY-MM-DD) (optioneel)'
            }
          },
          required: ['clientId', 'lineItems']
        }
      }
    },
    // Time Entry Tools
    {
      type: 'function',
      function: {
        name: 'list_time_entries',
        description: 'Haal een lijst op van urenregistraties. Kan gefilterd worden op klant, project of datum.',
        parameters: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              description: 'Filter op klant ID (optioneel)'
            },
            project: {
              type: 'string',
              description: 'Filter op projectnaam (optioneel)'
            },
            startDate: {
              type: 'string',
              description: 'Startdatum (YYYY-MM-DD) (optioneel)'
            },
            endDate: {
              type: 'string',
              description: 'Einddatum (YYYY-MM-DD) (optioneel)'
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'create_time_entry',
        description: 'Voeg een nieuwe urenregistratie toe. Gebruik dit wanneer de gebruiker uren wil registreren.',
        parameters: {
          type: 'object',
          properties: {
            project: {
              type: 'string',
              description: 'Projectnaam (verplicht)'
            },
            hours: {
              type: 'number',
              description: 'Aantal uren (verplicht, moet > 0 zijn)'
            },
            date: {
              type: 'string',
              description: 'Datum in YYYY-MM-DD formaat (verplicht)'
            },
            notes: {
              type: 'string',
              description: 'Notities over de gewerkte uren (optioneel)'
            },
            clientId: {
              type: 'string',
              description: 'ID van de klant (optioneel)'
            }
          },
          required: ['project', 'hours', 'date']
        }
      }
    },
    // Kilometer Entry Tools
    {
      type: 'function',
      function: {
        name: 'create_kilometer_entry',
        description: 'Voeg een nieuwe kilometerregistratie toe. Gebruik dit wanneer de gebruiker kilometers wil registreren.',
        parameters: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Datum in YYYY-MM-DD formaat (verplicht)'
            },
            kilometers: {
              type: 'number',
              description: 'Aantal kilometers (verplicht, moet > 0 zijn)'
            },
            purpose: {
              type: 'string',
              description: 'Doel van de rit (optioneel)'
            },
            clientId: {
              type: 'string',
              description: 'ID van de klant (optioneel)'
            },
            projectId: {
              type: 'string',
              description: 'ID van het project (optioneel)'
            }
          },
          required: ['date', 'kilometers']
        }
      }
    },
    // Project Management Tools
    {
      type: 'function',
      function: {
        name: 'list_projects',
        description: 'Haal een lijst op van alle projecten.',
        parameters: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              description: 'Filter op klant ID (optioneel)'
            },
            status: {
              type: 'string',
              description: 'Filter op status (optioneel, bijv. "active", "completed")'
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'create_project',
        description: 'Maak een nieuw project aan.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Naam van het project (verplicht)'
            },
            description: {
              type: 'string',
              description: 'Beschrijving van het project (optioneel)'
            },
            clientId: {
              type: 'string',
              description: 'ID van de klant (optioneel)'
            },
            hourlyRate: {
              type: 'number',
              description: 'Uurtarief voor dit project (optioneel)'
            },
            budget: {
              type: 'number',
              description: 'Budget voor dit project (optioneel)'
            }
          },
          required: ['name']
        }
      }
    },
    // Invoice Tools (already partially implemented, but let's add search)
    {
      type: 'function',
      function: {
        name: 'list_invoices',
        description: 'Haal een lijst op van alle facturen. Kan gefilterd worden op status of klant.',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
              description: 'Filter op status (optioneel)'
            },
            clientId: {
              type: 'string',
              description: 'Filter op klant ID (optioneel)'
            }
          },
          required: []
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'create_invoice',
        description: 'Maak een nieuwe factuur aan. Gebruik dit wanneer de gebruiker een factuur wil maken.',
        parameters: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              description: 'ID van de klant (verplicht)'
            },
            description: {
              type: 'string',
              description: 'Beschrijving van de factuur (optioneel)'
            },
            lineItems: {
              type: 'array',
              description: 'Lijst van regelitems voor de factuur',
              items: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'Beschrijving van het item'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Aantal'
                  },
                  rate: {
                    type: 'number',
                    description: 'Tarief per eenheid'
                  },
                  amount: {
                    type: 'number',
                    description: 'Totaalbedrag (quantity * rate)'
                  }
                },
                required: ['description', 'quantity', 'rate', 'amount']
              }
            },
            dueDate: {
              type: 'string',
              description: 'Vervaldatum (YYYY-MM-DD) (optioneel)'
            }
          },
          required: ['clientId', 'lineItems']
        }
      }
    },
    // Analytics Tools
    {
      type: 'function',
      function: {
        name: 'get_analytics',
        description: 'Haal analytics en statistieken op voor het dashboard. Toont revenue, facturen, klanten, en uren.',
        parameters: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['month', 'year'],
              description: 'Periode voor analytics (standaard: "month")',
              default: 'month'
            }
          },
          required: []
        }
      }
    },
    // Document Tools
    {
      type: 'function',
      function: {
        name: 'list_documents',
        description: 'Haal een lijst op van alle documenten. Kan gefilterd worden op folder of klant.',
        parameters: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description: 'Filter op folder ID (optioneel, gebruik "null" voor documenten zonder folder)'
            },
            clientId: {
              type: 'string',
              description: 'Filter op klant ID (optioneel)'
            },
            search: {
              type: 'string',
              description: 'Zoekterm voor documentnaam of beschrijving (optioneel)'
            }
          },
          required: []
        }
      }
    },
    // Automation Tools
    {
      type: 'function',
      function: {
        name: 'list_automations',
        description: 'Haal een lijst op van alle geconfigureerde automatiseringen.',
        parameters: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Filter op enabled status (optioneel)'
            }
          },
          required: []
        }
      }
    }
  ]
}

