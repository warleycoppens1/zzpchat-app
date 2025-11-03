/**
 * Context Retrieval for AI Responses
 * Retrieves relevant context from integrations for AI chat
 */

import { GmailService } from '../integrations/google/gmail'
import { DriveService } from '../integrations/google/drive'
import { CalendarService } from '../integrations/google/calendar'
import { OutlookMailService } from '../integrations/microsoft/outlook'
import { OutlookCalendarService } from '../integrations/microsoft/calendar'
import { prisma } from '../prisma'

export interface IntegrationContext {
  gmail?: {
    unreadCount: number
    recentEmails: Array<{
      subject: string
      from: string
      snippet: string
    }>
  }
  drive?: {
    recentFiles: Array<{
      name: string
      mimeType: string
      modifiedTime: Date
    }>
  }
  calendar?: {
    upcomingEvents: Array<{
      summary: string
      start: Date
      end: Date
    }>
  }
  outlook?: {
    unreadCount: number
    recentEmails: Array<{
      subject: string
      from: string
      bodyPreview: string
    }>
  }
}

/**
 * Get integration context for a user
 */
export async function getIntegrationContext(userId: string): Promise<IntegrationContext> {
  const context: IntegrationContext = {}

  try {
    // Check Gmail
    try {
      const gmail = new GmailService(userId)
      await gmail.load()
      const unread = await gmail.getUnreadMessages(5)
      const recent = await gmail.listMessages({ maxResults: 5 })
      
      context.gmail = {
        unreadCount: unread.length,
        recentEmails: recent.messages.slice(0, 5).map(msg => ({
          subject: msg.subject || 'No subject',
          from: msg.from || 'Unknown',
          snippet: msg.snippet || ''
        }))
      }
    } catch {
      // Gmail not connected, skip
    }

    // Check Google Drive
    try {
      const drive = new DriveService(userId)
      await drive.load()
      const files = await drive.listFiles({ pageSize: 5 })
      
      context.drive = {
        recentFiles: files.files.map(file => ({
          name: file.name,
          mimeType: file.mimeType,
          modifiedTime: file.modifiedTime || new Date()
        }))
      }
    } catch {
      // Drive not connected, skip
    }

    // Check Google Calendar
    try {
      const calendar = new CalendarService(userId)
      await calendar.load()
      const upcoming = await calendar.getUpcomingEvents(7)
      
      context.calendar = {
        upcomingEvents: upcoming.map(event => ({
          summary: event.summary,
          start: event.start,
          end: event.end
        }))
      }
    } catch {
      // Calendar not connected, skip
    }

    // Check Outlook Mail
    try {
      const outlook = new OutlookMailService(userId)
      await outlook.load()
      const unread = await outlook.getUnreadMessages(5)
      const recent = await outlook.listMessages({ top: 5 })
      
      context.outlook = {
        unreadCount: unread.length,
        recentEmails: recent.messages.slice(0, 5).map(msg => ({
          subject: msg.subject,
          from: msg.from?.emailAddress?.address || 'Unknown',
          bodyPreview: msg.bodyPreview || ''
        }))
      }
    } catch {
      // Outlook not connected, skip
    }
  } catch (error) {
    console.error('Error getting integration context:', error)
  }

  return context
}

/**
 * Format integration context for AI prompt
 */
export function formatContextForAI(context: IntegrationContext): string {
  const parts: string[] = []

  if (context.gmail) {
    parts.push(`📧 Gmail:
- ${context.gmail.unreadCount} ongelezen e-mails
- Recente e-mails:
${context.gmail.recentEmails.map(email => `  • ${email.subject} - van ${email.from}`).join('\n')}`)
  }

  if (context.drive && context.drive.recentFiles.length > 0) {
    parts.push(`☁️ Google Drive:
- Recente bestanden:
${context.drive.recentFiles.map(file => `  • ${file.name} (${file.mimeType})`).join('\n')}`)
  }

  if (context.calendar && context.calendar.upcomingEvents.length > 0) {
    parts.push(`📅 Agenda:
- Aankomende events:
${context.calendar.upcomingEvents.map(event => `  • ${event.summary} - ${event.start.toLocaleString('nl-NL')}`).join('\n')}`)
  }

  if (context.outlook) {
    parts.push(`📨 Outlook:
- ${context.outlook.unreadCount} ongelezen e-mails
- Recente e-mails:
${context.outlook.recentEmails.map(email => `  • ${email.subject} - van ${email.from}`).join('\n')}`)
  }

  return parts.length > 0
    ? `\n\nINTEGRATIE CONTEXT:\n${parts.join('\n\n')}\n`
    : ''
}

/**
 * Check which integrations are available for a user
 */
export async function getAvailableIntegrations(userId: string): Promise<string[]> {
  const integrations = await prisma.integration.findMany({
    where: {
      userId,
      status: 'CONNECTED'
    },
    select: {
      type: true
    }
  })

  const integrationNames: Record<string, string> = {
    'GMAIL': 'gmail',
    'GOOGLE_DRIVE': 'drive',
    'GOOGLE_CALENDAR': 'calendar',
    'OUTLOOK_MAIL': 'outlook',
    'OUTLOOK_CALENDAR': 'outlook-calendar'
  }

  return integrations
    .map(i => integrationNames[i.type] || i.type.toLowerCase())
    .filter(Boolean)
}

