/**
 * AI Tool Execution Engine
 * Executes tools called by the AI
 */

import { GmailService } from '../integrations/google/gmail'
import { DriveService } from '../integrations/google/drive'
import { CalendarService } from '../integrations/google/calendar'
import { OutlookMailService } from '../integrations/microsoft/outlook'
import { OutlookCalendarService } from '../integrations/microsoft/calendar'
import { BrowserController } from '../browser-automation/browser-controller'
import { prisma } from '../prisma'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export interface ToolCall {
  name: string
  arguments: Record<string, any>
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * Execute a tool call from the AI
 */
export async function executeTool(
  toolCall: ToolCall,
  userId: string
): Promise<ToolResult> {
  try {
    const { name, arguments: args } = toolCall

    // Route to appropriate handler
    switch (name) {
      // Gmail tools
      case 'gmail_search_emails':
        return await executeGmailSearch(userId, args)
      
      case 'gmail_get_unread':
        return await executeGmailGetUnread(userId, args)
      
      case 'gmail_send_email':
        return await executeGmailSend(userId, args)
      
      case 'gmail_get_message':
        return await executeGmailGetMessage(userId, args)

      // Google Drive tools
      case 'drive_search_files':
        return await executeDriveSearch(userId, args)
      
      case 'drive_list_files':
        return await executeDriveListFiles(userId, args)
      
      case 'drive_upload_file':
        return await executeDriveUpload(userId, args)
      
      case 'drive_create_folder':
        return await executeDriveCreateFolder(userId, args)

      // Google Calendar tools
      case 'calendar_list_events':
        return await executeCalendarListEvents(userId, args)
      
      case 'calendar_get_upcoming':
        return await executeCalendarGetUpcoming(userId, args)
      
      case 'calendar_create_event':
        return await executeCalendarCreateEvent(userId, args)
      
      case 'calendar_update_event':
        return await executeCalendarUpdateEvent(userId, args)
      
      case 'calendar_delete_event':
        return await executeCalendarDeleteEvent(userId, args)

      // Outlook Mail tools
      case 'outlook_search_emails':
        return await executeOutlookSearch(userId, args)
      
      case 'outlook_send_email':
        return await executeOutlookSend(userId, args)

      // Outlook Calendar tools
      case 'outlook_list_events':
        return await executeOutlookListEvents(userId, args)
      
      case 'outlook_create_event':
        return await executeOutlookCreateEvent(userId, args)

      // Integration status
      case 'check_integration_status':
        return await executeCheckIntegrationStatus(userId, args)

      // Browser automation tools
      case 'browser_navigate':
        return await executeBrowserNavigate(userId, args)
      
      case 'browser_click':
        return await executeBrowserClick(userId, args)
      
      case 'browser_type':
        return await executeBrowserType(userId, args)
      
      case 'browser_screenshot':
        return await executeBrowserScreenshot(userId, args)
      
      case 'browser_extract':
        return await executeBrowserExtract(userId, args)
      
      case 'browser_execute_sequence':
        return await executeBrowserSequence(userId, args)

      // Client management tools
      case 'list_clients':
        return await executeListClients(userId, args)
      
      case 'search_clients':
        return await executeSearchClients(userId, args)
      
      case 'create_client':
        return await executeCreateClient(userId, args)

      // Quote management tools
      case 'list_quotes':
        return await executeListQuotes(userId, args)
      
      case 'create_quote':
        return await executeCreateQuote(userId, args)

      // Invoice management tools
      case 'list_invoices':
        return await executeListInvoices(userId, args)
      
      case 'create_invoice':
        return await executeCreateInvoice(userId, args)

      // Time entry tools
      case 'list_time_entries':
        return await executeListTimeEntries(userId, args)
      
      case 'create_time_entry':
        return await executeCreateTimeEntry(userId, args)

      // Kilometer entry tools
      case 'create_kilometer_entry':
        return await executeCreateKilometerEntry(userId, args)

      // Project management tools
      case 'list_projects':
        return await executeListProjects(userId, args)
      
      case 'create_project':
        return await executeCreateProject(userId, args)

      // Analytics tools
      case 'get_analytics':
        return await executeGetAnalytics(userId, args)

      // Document tools
      case 'list_documents':
        return await executeListDocuments(userId, args)

      // Automation tools
      case 'list_automations':
        return await executeListAutomations(userId, args)

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`
        }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Tool execution failed',
      message: `Failed to execute ${toolCall.name}`
    }
  }
}

// Gmail tool handlers
async function executeGmailSearch(userId: string, args: any): Promise<ToolResult> {
  try {
    const gmail = new GmailService(userId)
    await gmail.load()
    
    const result = await gmail.searchMessages(
      args.query,
      args.maxResults || 10
    )

    return {
      success: true,
      data: result.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from,
        snippet: msg.snippet,
        date: msg.date
      })),
      message: `Found ${result.length} emails`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Gmail not connected. Please connect Gmail in integrations first.'
    }
  }
}

async function executeGmailGetUnread(userId: string, args: any): Promise<ToolResult> {
  try {
    const gmail = new GmailService(userId)
    await gmail.load()
    
    const result = await gmail.getUnreadMessages(args.maxResults || 10)

    return {
      success: true,
      data: result.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from,
        snippet: msg.snippet,
        date: msg.date
      })),
      message: `Found ${result.length} unread emails`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Gmail not connected'
    }
  }
}

async function executeGmailSend(userId: string, args: any): Promise<ToolResult> {
  try {
    const gmail = new GmailService(userId)
    await gmail.load()
    
    const messageId = await gmail.sendMessage(
      args.to,
      args.subject,
      args.body
    )

    return {
      success: true,
      data: { messageId },
      message: `Email sent successfully to ${args.to}`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    }
  }
}

async function executeGmailGetMessage(userId: string, args: any): Promise<ToolResult> {
  try {
    const gmail = new GmailService(userId)
    await gmail.load()
    
    const message = await gmail.getMessage(args.messageId)

    return {
      success: true,
      data: {
        id: message.id,
        subject: message.subject,
        from: message.from,
        to: message.to,
        body: message.body,
        date: message.date
      },
      message: 'Email retrieved'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve email'
    }
  }
}

// Google Drive tool handlers
async function executeDriveSearch(userId: string, args: any): Promise<ToolResult> {
  try {
    const drive = new DriveService(userId)
    await drive.load()
    
    const result = await drive.searchFiles(args.query, args.maxResults || 10)

    return {
      success: true,
      data: result.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        webViewLink: file.webViewLink
      })),
      message: `Found ${result.length} files`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Google Drive not connected'
    }
  }
}

async function executeDriveListFiles(userId: string, args: any): Promise<ToolResult> {
  try {
    const drive = new DriveService(userId)
    await drive.load()
    
    const result = await drive.listFiles({
      folderId: args.folderId,
      pageSize: args.maxResults || 20
    })

    return {
      success: true,
      data: result.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        webViewLink: file.webViewLink
      })),
      message: `Found ${result.files.length} files`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Google Drive not connected'
    }
  }
}

async function executeDriveUpload(userId: string, args: any): Promise<ToolResult> {
  try {
    const drive = new DriveService(userId)
    await drive.load()
    
    const contentBuffer = Buffer.from(args.content, 'utf-8')
    const file = await drive.uploadFile(
      args.name,
      args.mimeType || 'text/plain',
      contentBuffer,
      args.parentFolderId
    )

    return {
      success: true,
      data: {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink
      },
      message: `File ${file.name} uploaded successfully`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to upload file'
    }
  }
}

async function executeDriveCreateFolder(userId: string, args: any): Promise<ToolResult> {
  try {
    const drive = new DriveService(userId)
    await drive.load()
    
    const folder = await drive.createFolder(args.name, args.parentFolderId)

    return {
      success: true,
      data: {
        id: folder.id,
        name: folder.name,
        webViewLink: folder.webViewLink
      },
      message: `Folder ${folder.name} created successfully`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create folder'
    }
  }
}

// Google Calendar tool handlers
async function executeCalendarListEvents(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new CalendarService(userId)
    await calendar.load()
    
    const events = await calendar.listEvents({
      timeMin: args.startDate ? new Date(args.startDate) : undefined,
      timeMax: args.endDate ? new Date(args.endDate) : undefined,
      maxResults: args.maxResults || 20
    })

    return {
      success: true,
      data: events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        location: event.location,
        htmlLink: event.htmlLink
      })),
      message: `Found ${events.length} events`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Google Calendar not connected'
    }
  }
}

async function executeCalendarGetUpcoming(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new CalendarService(userId)
    await calendar.load()
    
    const events = await calendar.getUpcomingEvents(args.days || 7)

    return {
      success: true,
      data: events.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        location: event.location
      })),
      message: `Found ${events.length} upcoming events`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Google Calendar not connected'
    }
  }
}

async function executeCalendarCreateEvent(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new CalendarService(userId)
    await calendar.load()
    
    const event = await calendar.createEvent(
      args.summary,
      new Date(args.start),
      new Date(args.end),
      {
        description: args.description,
        location: args.location,
        attendees: args.attendees
      }
    )

    return {
      success: true,
      data: {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink
      },
      message: `Event "${event.summary}" created successfully`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create event'
    }
  }
}

async function executeCalendarUpdateEvent(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new CalendarService(userId)
    await calendar.load()
    
    const event = await calendar.updateEvent(
      args.eventId,
      {
        summary: args.summary,
        description: args.description,
        start: args.start ? new Date(args.start) : undefined,
        end: args.end ? new Date(args.end) : undefined
      }
    )

    return {
      success: true,
      data: {
        id: event.id,
        summary: event.summary
      },
      message: `Event updated successfully`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update event'
    }
  }
}

async function executeCalendarDeleteEvent(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new CalendarService(userId)
    await calendar.load()
    
    await calendar.deleteEvent(args.eventId)

    return {
      success: true,
      message: 'Event deleted successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete event'
    }
  }
}

// Outlook Mail tool handlers
async function executeOutlookSearch(userId: string, args: any): Promise<ToolResult> {
  try {
    const outlook = new OutlookMailService(userId)
    await outlook.load()
    
    const result = await outlook.searchMessages(args.query, args.maxResults || 10)

    return {
      success: true,
      data: result.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from?.emailAddress?.address,
        bodyPreview: msg.bodyPreview,
        receivedDateTime: msg.receivedDateTime
      })),
      message: `Found ${result.length} emails`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Outlook not connected'
    }
  }
}

async function executeOutlookSend(userId: string, args: any): Promise<ToolResult> {
  try {
    const outlook = new OutlookMailService(userId)
    await outlook.load()
    
    const messageId = await outlook.sendMessage(
      args.to,
      args.subject,
      args.body
    )

    return {
      success: true,
      data: { messageId },
      message: `Email sent successfully to ${args.to}`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    }
  }
}

// Outlook Calendar tool handlers
async function executeOutlookListEvents(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new OutlookCalendarService(userId)
    await calendar.load()
    
    const events = await calendar.listEvents({
      startDateTime: args.startDate ? new Date(args.startDate) : undefined,
      endDateTime: args.endDate ? new Date(args.endDate) : undefined,
      top: args.maxResults || 20
    })

    return {
      success: true,
      data: events.map(event => ({
        id: event.id,
        subject: event.subject,
        start: event.start,
        end: event.end,
        location: event.location
      })),
      message: `Found ${events.length} events`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Outlook Calendar not connected'
    }
  }
}

async function executeOutlookCreateEvent(userId: string, args: any): Promise<ToolResult> {
  try {
    const calendar = new OutlookCalendarService(userId)
    await calendar.load()
    
    const event = await calendar.createEvent(
      args.subject,
      new Date(args.start),
      new Date(args.end),
      {
        body: args.body,
        location: args.location,
        attendees: args.attendees
      }
    )

    return {
      success: true,
      data: {
        id: event.id,
        subject: event.subject,
        start: event.start,
        end: event.end,
        webLink: event.webLink
      },
      message: `Event "${event.subject}" created successfully`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create event'
    }
  }
}

// Integration status check
async function executeCheckIntegrationStatus(userId: string, args: any): Promise<ToolResult> {
  try {
    const integrationMap: Record<string, any> = {
      'gmail': 'GMAIL',
      'drive': 'GOOGLE_DRIVE',
      'calendar': 'GOOGLE_CALENDAR',
      'outlook': 'OUTLOOK_MAIL',
      'outlook-calendar': 'OUTLOOK_CALENDAR'
    }

    const integrationType = integrationMap[args.integration]
    if (!integrationType) {
      return {
        success: false,
        error: `Unknown integration: ${args.integration}`
      }
    }

    const integration = await prisma.integration.findUnique({
      where: {
        type_userId: {
          type: integrationType as any,
          userId
        }
      },
      select: {
        status: true,
        connectedAt: true,
        expiresAt: true,
        lastSync: true
      }
    })

    if (!integration || integration.status !== 'CONNECTED') {
      return {
        success: true,
        data: {
          connected: false,
          integration: args.integration
        },
        message: `${args.integration} is not connected`
      }
    }

    return {
      success: true,
      data: {
        connected: true,
        integration: args.integration,
        connectedAt: integration.connectedAt,
        expiresAt: integration.expiresAt,
        lastSync: integration.lastSync
      },
      message: `${args.integration} is connected`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to check integration status'
    }
  }
}

// Browser automation tool handlers
async function executeBrowserNavigate(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    const result = await browserController.executeAction({
      type: 'navigate',
      url: args.url,
      timeout: args.timeout || 30000,
    })

    let screenshot: string | undefined
    if (args.screenshot) {
      const screenshotResult = await browserController.executeAction({
        type: 'screenshot',
        options: ['fullPage'],
      })
      screenshot = screenshotResult.screenshot
    }

    await browserController.close()

    return {
      success: result.success,
      data: {
        ...result.data,
        screenshot,
        url: result.url,
      },
      message: result.data?.message || `Navigated to ${args.url}`,
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser navigation failed'
    }
  }
}

async function executeBrowserClick(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    const result = await browserController.executeAction({
      type: 'click',
      selector: args.selector,
      timeout: args.timeout || 10000,
    })

    let screenshot: string | undefined
    if (args.screenshot) {
      const screenshotResult = await browserController.executeAction({
        type: 'screenshot',
      })
      screenshot = screenshotResult.screenshot
    }

    await browserController.close()

    return {
      success: result.success,
      data: {
        ...result.data,
        screenshot,
        url: result.url,
      },
      message: result.data?.message || `Clicked element: ${args.selector}`,
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser click failed'
    }
  }
}

async function executeBrowserType(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    const result = await browserController.executeAction({
      type: 'type',
      selector: args.selector,
      text: args.text,
      timeout: args.timeout || 10000,
    })

    let screenshot: string | undefined
    if (args.screenshot) {
      const screenshotResult = await browserController.executeAction({
        type: 'screenshot',
      })
      screenshot = screenshotResult.screenshot
    }

    await browserController.close()

    return {
      success: result.success,
      data: {
        ...result.data,
        screenshot,
        url: result.url,
      },
      message: result.data?.message || `Typed text into: ${args.selector}`,
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser type failed'
    }
  }
}

async function executeBrowserScreenshot(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    const result = await browserController.executeAction({
      type: 'screenshot',
      options: args.fullPage ? ['fullPage'] : [],
    })

    await browserController.close()

    return {
      success: result.success,
      data: {
        screenshot: result.screenshot,
      },
      message: 'Screenshot captured',
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser screenshot failed'
    }
  }
}

async function executeBrowserExtract(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    const result = await browserController.executeAction({
      type: 'extract',
      selector: args.selector,
      timeout: args.timeout || 10000,
    })

    await browserController.close()

    return {
      success: result.success,
      data: result.data?.extracted,
      message: `Extracted data from: ${args.selector}`,
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser extract failed'
    }
  }
}

async function executeBrowserSequence(userId: string, args: any): Promise<ToolResult> {
  let browserController: BrowserController | null = null
  try {
    browserController = new BrowserController()
    await browserController.createPage()
    
    // Build actions array
    const actions = args.actions || []
    
    // Add navigation if URL provided and first action isn't navigate
    if (args.url && (!actions[0] || actions[0].type !== 'navigate')) {
      actions.unshift({
        type: 'navigate',
        url: args.url,
        timeout: 30000,
      })
    }

    const results = await browserController.executeSequence(actions)

    let screenshot: string | undefined
    if (args.screenshot) {
      const screenshotResult = await browserController.executeAction({
        type: 'screenshot',
        options: ['fullPage'],
      })
      screenshot = screenshotResult.screenshot
    }

    await browserController.close()

    const summary = {
      total: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    }

    return {
      success: summary.failed === 0,
      data: {
        results,
        summary,
        screenshot,
      },
      message: `Executed ${summary.total} browser actions`,
    }
  } catch (error: any) {
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
      message: 'Browser sequence failed'
    }
  }
}

// Client management tool handlers
async function executeListClients(userId: string, args: any): Promise<ToolResult> {
  try {
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        totalRevenue: true,
        totalInvoices: true,
      },
    })

    return {
      success: true,
      data: clients,
      message: `Found ${clients.length} clients`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list clients',
    }
  }
}

async function executeSearchClients(userId: string, args: any): Promise<ToolResult> {
  try {
    const { query } = args
    const clients = await prisma.client.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
      },
    })

    return {
      success: true,
      data: clients,
      message: `Found ${clients.length} matching clients`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search clients',
    }
  }
}

async function executeCreateClient(userId: string, args: any): Promise<ToolResult> {
  try {
    const client = await prisma.client.create({
      data: {
        name: args.name,
        email: args.email || null,
        company: args.company || null,
        phone: args.phone || null,
        address: args.address || null,
        userId,
      },
    })

    return {
      success: true,
      data: client,
      message: `Client "${client.name}" created successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create client',
    }
  }
}

// Quote management tool handlers
async function executeListQuotes(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }
    if (args.status) where.status = args.status
    if (args.clientId) where.clientId = args.clientId

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      take: 50,
    })

    return {
      success: true,
      data: quotes,
      message: `Found ${quotes.length} quotes`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list quotes',
    }
  }
}

async function executeCreateQuote(userId: string, args: any): Promise<ToolResult> {
  try {
    // Verify client
    const client = await prisma.client.findFirst({
      where: { id: args.clientId, userId },
    })

    if (!client) {
      return {
        success: false,
        error: 'Client not found',
        message: 'Client does not exist or does not belong to you',
      }
    }

    // Calculate total
    const amount = args.lineItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

    // Generate quote number
    const count = await prisma.quote.count({ where: { userId } })
    const quoteNumber = `Q-${String(count + 1).padStart(4, '0')}`

    const quote = await prisma.quote.create({
      data: {
        number: quoteNumber,
        clientId: args.clientId,
        amount,
        lineItems: args.lineItems,
        description: args.description || null,
        validUntil: args.validUntil ? new Date(args.validUntil) : null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return {
      success: true,
      data: quote,
      message: `Quote ${quote.number} created successfully for €${amount.toFixed(2)}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create quote',
    }
  }
}

// Invoice management tool handlers
async function executeListInvoices(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }
    if (args.status) where.status = args.status
    if (args.clientId) where.clientId = args.clientId

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      take: 50,
    })

    return {
      success: true,
      data: invoices,
      message: `Found ${invoices.length} invoices`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list invoices',
    }
  }
}

async function executeCreateInvoice(userId: string, args: any): Promise<ToolResult> {
  try {
    // Verify client
    const client = await prisma.client.findFirst({
      where: { id: args.clientId, userId },
    })

    if (!client) {
      return {
        success: false,
        error: 'Client not found',
        message: 'Client does not exist or does not belong to you',
      }
    }

    // Calculate total
    const totalAmount = args.lineItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { userId } })
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId: args.clientId,
        amount: totalAmount,
        lineItems: args.lineItems,
        description: args.description || null,
        dueDate: args.dueDate ? new Date(args.dueDate) : null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return {
      success: true,
      data: invoice,
      message: `Invoice ${invoice.number} created successfully for €${totalAmount.toFixed(2)}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create invoice',
    }
  }
}

// Time entry tool handlers
async function executeListTimeEntries(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }
    if (args.clientId) where.clientId = args.clientId
    if (args.project) where.project = { contains: args.project, mode: 'insensitive' }
    if (args.startDate || args.endDate) {
      where.date = {}
      if (args.startDate) where.date.gte = new Date(args.startDate)
      if (args.endDate) where.date.lte = new Date(args.endDate)
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      take: 50,
    })

    const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)

    return {
      success: true,
      data: {
        entries: timeEntries,
        totalHours: totalHours.toFixed(2),
      },
      message: `Found ${timeEntries.length} time entries (total: ${totalHours.toFixed(2)} hours)`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list time entries',
    }
  }
}

async function executeCreateTimeEntry(userId: string, args: any): Promise<ToolResult> {
  try {
    // Verify client if provided
    if (args.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: args.clientId, userId },
      })
      if (!client) {
        return {
          success: false,
          error: 'Client not found',
          message: 'Client does not exist or does not belong to you',
        }
      }
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        project: args.project,
        hours: args.hours,
        date: new Date(args.date),
        notes: args.notes || null,
        clientId: args.clientId || null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return {
      success: true,
      data: timeEntry,
      message: `Time entry created: ${args.hours} hours for project "${args.project}" on ${args.date}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create time entry',
    }
  }
}

// Kilometer entry tool handlers
async function executeCreateKilometerEntry(userId: string, args: any): Promise<ToolResult> {
  try {
    // Verify client if provided
    if (args.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: args.clientId, userId },
      })
      if (!client) {
        return {
          success: false,
          error: 'Client not found',
          message: 'Client does not exist or does not belong to you',
        }
      }
    }

    const kilometerEntry = await prisma.kilometerEntry.create({
      data: {
        date: new Date(args.date),
        fromLocation: args.fromLocation || args.from || 'Unknown',
        toLocation: args.toLocation || args.to || 'Unknown',
        distanceKm: args.distanceKm || args.kilometers || 0,
        purpose: args.purpose || null,
        type: args.type || 'zakelijk',
        isBillable: args.isBillable !== undefined ? args.isBillable : true,
        clientId: args.clientId || null,
        projectId: args.projectId || null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return {
      success: true,
      data: kilometerEntry,
      message: `Kilometer entry created: ${args.distanceKm || args.kilometers || 0} km on ${args.date}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create kilometer entry',
    }
  }
}

// Project management tool handlers
async function executeListProjects(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }
    if (args.clientId) where.clientId = args.clientId
    if (args.status) where.status = args.status

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
      },
    })

    return {
      success: true,
      data: projects,
      message: `Found ${projects.length} projects`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list projects',
    }
  }
}

async function executeCreateProject(userId: string, args: any): Promise<ToolResult> {
  try {
    // Verify client if provided
    if (args.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: args.clientId, userId },
      })
      if (!client) {
        return {
          success: false,
          error: 'Client not found',
          message: 'Client does not exist or does not belong to you',
        }
      }
    }

    const project = await prisma.project.create({
      data: {
        name: args.name,
        description: args.description || null,
        clientId: args.clientId || null,
        hourlyRate: args.hourlyRate || null,
        budget: args.budget || null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return {
      success: true,
      data: project,
      message: `Project "${project.name}" created successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create project',
    }
  }
}

// Analytics tool handlers
async function executeGetAnalytics(userId: string, args: any): Promise<ToolResult> {
  try {
    const period = args.period || 'month'

    let dateStart: Date
    let dateEnd: Date = new Date()

    switch (period) {
      case 'year':
        dateStart = startOfYear(new Date())
        dateEnd = endOfYear(new Date())
        break
      case 'month':
      default:
        dateStart = startOfMonth(new Date())
        dateEnd = endOfMonth(new Date())
        break
    }

    // Get revenue analytics
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        amount: true,
        status: true,
      },
    })

    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.amount), 0)

    const invoiceStats = {
      total: invoices.length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      pending: invoices.filter(inv => inv.status === 'SENT').length,
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
    }

    // Get client count
    const clientCount = await prisma.client.count({
      where: { userId },
    })

    // Get time entry stats
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: { gte: dateStart, lte: dateEnd },
      },
      select: {
        hours: true,
      },
    })

    const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)

    return {
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          period: period,
        },
        invoices: invoiceStats,
        clients: clientCount,
        timeTracking: {
          totalHours: totalHours.toFixed(2),
          entriesCount: timeEntries.length,
        },
      },
      message: `Analytics retrieved for ${period} period: €${totalRevenue.toFixed(2)} revenue, ${invoiceStats.total} invoices, ${clientCount} clients, ${totalHours.toFixed(2)} hours`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get analytics',
    }
  }
}

// Document tool handlers
async function executeListDocuments(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }

    if (args.folderId === 'null' || args.folderId === '') {
      where.folderId = null
    } else if (args.folderId) {
      where.folderId = args.folderId
    }

    if (args.clientId) {
      where.clientId = args.clientId
    }

    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ]
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      take: 50,
    })

    return {
      success: true,
      data: documents,
      message: `Found ${documents.length} documents`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list documents',
    }
  }
}

// Automation tool handlers
async function executeListAutomations(userId: string, args: any): Promise<ToolResult> {
  try {
    const where: any = { userId }
    if (args.enabled !== undefined) {
      where.enabled = args.enabled
    }

    const automations = await prisma.automation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        triggerType: true,
        enabled: true,
        lastRunAt: true,
        nextRunAt: true,
        runCount: true,
        successCount: true,
        errorCount: true,
      },
    })

    return {
      success: true,
      data: automations,
      message: `Found ${automations.length} automations`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to list automations',
    }
  }
}

