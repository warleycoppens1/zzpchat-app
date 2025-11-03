/**
 * n8n Workflow Action Router
 * Routes workflow actions to appropriate internal handlers
 */

import { WorkflowContext } from './workflow-context'
import { prisma } from './prisma'
import { z } from 'zod'

export interface WorkflowAction {
  action: string
  parameters: Record<string, any>
  userId: string
}

export interface WorkflowResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

/**
 * Route workflow action to appropriate handler
 */
export async function routeWorkflowAction(
  action: string,
  parameters: Record<string, any>,
  context: WorkflowContext
): Promise<WorkflowResponse> {
  try {
    switch (action.toLowerCase()) {
      case 'create_invoice':
      case 'invoice.create':
        return await handleCreateInvoice(parameters, context)
      
      case 'create_quote':
      case 'quote.create':
        return await handleCreateQuote(parameters, context)
      
      case 'add_time_entry':
      case 'time_entry.create':
      case 'time.create':
        return await handleAddTimeEntry(parameters, context)
      
      case 'add_kilometer':
      case 'kilometer.create':
      case 'km.create':
        return await handleAddKilometer(parameters, context)
      
      case 'create_contact':
      case 'contact.create':
        return await handleCreateContact(parameters, context)
      
      case 'search_contacts':
      case 'contacts.search':
        return await handleSearchContacts(parameters, context)
      
      case 'get_invoices':
      case 'invoices.list':
        return await handleGetInvoices(parameters, context)
      
      case 'get_quotes':
      case 'quotes.list':
        return await handleGetQuotes(parameters, context)
      
      case 'ai_intent':
      case 'ai.chat':
        return await handleAIChat(parameters, context)
      
      case 'context_search':
      case 'search.context':
        return await handleContextSearch(parameters, context)
      
      default:
        return {
          success: false,
          error: `Unknown action: ${action}`,
          message: `Available actions: create_invoice, create_quote, add_time_entry, add_kilometer, create_contact, search_contacts, get_invoices, get_quotes, ai_intent, context_search`
        }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: `Failed to execute action: ${action}`
    }
  }
}

// Action handlers - direct database/API calls
const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
  amount: z.number().min(0),
})

async function handleCreateInvoice(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    // Validate client
    if (!parameters.clientId) {
      return { success: false, error: 'clientId is required' }
    }

    const client = await prisma.client.findFirst({
      where: { id: parameters.clientId, userId: context.userId }
    })

    if (!client) {
      return { success: false, error: 'Client not found' }
    }

    // Parse line items
    const lineItems = parameters.lineItems || [{
      description: parameters.description || 'Service',
      quantity: parameters.quantity || 1,
      rate: parameters.amount || 0,
      amount: parameters.amount || 0
    }]

    // Validate line items
    const validatedLineItems = lineItems.map((item: any) => lineItemSchema.parse(item))

    // Calculate totals
    const subtotal = validatedLineItems.reduce((sum: number, item: any) => sum + item.amount, 0)
    const taxRate = parameters.taxRate || 21.0
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    // Generate invoice number
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
      where: {
        userId: context.userId,
        number: { startsWith: `INV-${year}-` }
      }
    })
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        amount: totalAmount,
        clientId: parameters.clientId,
        userId: context.userId,
        dueDate: parameters.dueDate ? new Date(parameters.dueDate) : null,
        description: parameters.description,
        lineItems: validatedLineItems,
        taxRate: taxRate,
        taxAmount: taxAmount,
        subtotal: subtotal,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return {
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create invoice',
      message: error.message
    }
  }
}

async function handleCreateQuote(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    if (!parameters.clientId) {
      return { success: false, error: 'clientId is required' }
    }

    const client = await prisma.client.findFirst({
      where: { id: parameters.clientId, userId: context.userId }
    })

    if (!client) {
      return { success: false, error: 'Client not found' }
    }

    const lineItems = parameters.lineItems || [{
      description: parameters.description || 'Service',
      quantity: parameters.quantity || 1,
      rate: parameters.amount || 0,
      amount: parameters.amount || 0
    }]

    const validatedLineItems = lineItems.map((item: any) => lineItemSchema.parse(item))
    const subtotal = validatedLineItems.reduce((sum: number, item: any) => sum + item.amount, 0)
    const taxRate = parameters.taxRate || 21.0
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    const year = new Date().getFullYear()
    const count = await prisma.quote.count({
      where: {
        userId: context.userId,
        number: { startsWith: `QUO-${year}-` }
      }
    })
    const quoteNumber = `QUO-${year}-${String(count + 1).padStart(3, '0')}`

    const validUntil = parameters.validUntil 
      ? new Date(parameters.validUntil) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default

    const quote = await prisma.quote.create({
      data: {
        number: quoteNumber,
        amount: totalAmount,
        clientId: parameters.clientId,
        userId: context.userId,
        validUntil: validUntil,
        description: parameters.description,
        lineItems: validatedLineItems,
        taxRate: taxRate,
        taxAmount: taxAmount,
        subtotal: subtotal,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return {
      success: true,
      data: quote,
      message: 'Quote created successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create quote',
      message: error.message
    }
  }
}

async function handleAddTimeEntry(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    if (!parameters.project && !parameters.projectName) {
      return { success: false, error: 'project is required' }
    }

    if (!parameters.hours && !parameters.hour) {
      return { success: false, error: 'hours is required' }
    }

    // Validate client if provided
    if (parameters.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: parameters.clientId, userId: context.userId }
      })
      if (!client) {
        return { success: false, error: 'Client not found' }
      }
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        project: parameters.project || parameters.projectName,
        hours: parameters.hours || parameters.hour,
        date: new Date(parameters.date || new Date().toISOString().split('T')[0]),
        notes: parameters.notes,
        clientId: parameters.clientId || null,
        userId: context.userId,
        billable: parameters.billable !== undefined ? parameters.billable : true
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      }
    })

    return {
      success: true,
      data: timeEntry,
      message: 'Time entry added successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to add time entry',
      message: error.message
    }
  }
}

async function handleAddKilometer(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    if (!parameters.fromLocation && !parameters.from) {
      return { success: false, error: 'fromLocation is required' }
    }

    if (!parameters.toLocation && !parameters.to) {
      return { success: false, error: 'toLocation is required' }
    }

    if (!parameters.distanceKm && !parameters.distance) {
      return { success: false, error: 'distanceKm is required' }
    }

    if (!parameters.purpose) {
      return { success: false, error: 'purpose is required' }
    }

    // Validate client/project if provided
    if (parameters.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: parameters.clientId, userId: context.userId }
      })
      if (!client) {
        return { success: false, error: 'Client not found' }
      }
    }

    if (parameters.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: parameters.projectId, userId: context.userId }
      })
      if (!project) {
        return { success: false, error: 'Project not found' }
      }
    }

    const kilometerEntry = await prisma.kilometerEntry.create({
      data: {
        date: new Date(parameters.date || new Date().toISOString().split('T')[0]),
        fromLocation: parameters.fromLocation || parameters.from,
        toLocation: parameters.toLocation || parameters.to,
        distanceKm: parameters.distanceKm || parameters.distance,
        purpose: parameters.purpose,
        type: parameters.type || 'zakelijk',
        notes: parameters.notes,
        isBillable: parameters.isBillable !== undefined ? parameters.isBillable : true,
        clientId: parameters.clientId || null,
        projectId: parameters.projectId || null,
        userId: context.userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return {
      success: true,
      data: kilometerEntry,
      message: 'Kilometer entry added successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to add kilometer entry',
      message: error.message
    }
  }
}

async function handleCreateContact(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    if (!parameters.name) {
      return { success: false, error: 'name is required' }
    }

    const contact = await prisma.client.create({
      data: {
        name: parameters.name,
        email: parameters.email || null,
        phone: parameters.phone || null,
        company: parameters.company || null,
        position: parameters.position || null,
        notes: parameters.notes || null,
        tags: parameters.tags || [],
        userId: context.userId,
      },
      include: {
        _count: {
          select: {
            invoices: true,
            quotes: true,
            timeEntries: true,
          }
        }
      }
    })

    return {
      success: true,
      data: contact,
      message: 'Contact created successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create contact',
      message: error.message
    }
  }
}

async function handleSearchContacts(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    const where: any = { userId: context.userId }
    
    if (parameters.search) {
      where.OR = [
        { name: { contains: parameters.search, mode: 'insensitive' } },
        { email: { contains: parameters.search, mode: 'insensitive' } },
        { company: { contains: parameters.search, mode: 'insensitive' } },
        { phone: { contains: parameters.search, mode: 'insensitive' } }
      ]
    }
    
    if (parameters.tag) {
      where.tags = {
        has: parameters.tag
      }
    }

    const contacts = await prisma.client.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            invoices: true,
            quotes: true,
            timeEntries: true,
          }
        }
      }
    })

    return {
      success: true,
      data: contacts,
      message: `Found ${contacts.length} contacts`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to search contacts',
      message: error.message
    }
  }
}

async function handleGetInvoices(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    const where: any = { userId: context.userId }
    
    if (parameters.status) where.status = parameters.status
    if (parameters.clientId) where.clientId = parameters.clientId

    const page = parseInt(parameters.page) || 1
    const limit = parseInt(parameters.limit) || 10

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ])

    return {
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: `Retrieved ${invoices.length} invoices`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get invoices',
      message: error.message
    }
  }
}

async function handleGetQuotes(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    const where: any = { userId: context.userId }
    
    if (parameters.status) where.status = parameters.status
    if (parameters.clientId) where.clientId = parameters.clientId

    const page = parseInt(parameters.page) || 1
    const limit = parseInt(parameters.limit) || 10

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true
            }
          }
        }
      }),
      prisma.quote.count({ where })
    ])

    return {
      success: true,
      data: {
        quotes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: `Retrieved ${quotes.length} quotes`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get quotes',
      message: error.message
    }
  }
}

async function handleAIChat(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    // Import AI service dynamically to avoid circular dependencies
    const { AIAgentService } = await import('./ai-agent')
    const aiAgent = new AIAgentService()

    if (!parameters.message) {
      return { success: false, error: 'message is required' }
    }

    // Analyze intent
    const intentResult = await aiAgent.analyzeIntent(
      parameters.message,
      context.userId,
      parameters.conversationHistory || []
    )

    // Generate response
    const response = await aiAgent.generateResponse(
      parameters.message,
      context.userId,
      parameters.conversationHistory || []
    )

    return {
      success: true,
      data: {
        response: response.response,
        intent: intentResult.intent,
        action: intentResult.action,
        reasoning: intentResult.reasoning,
        confidence: intentResult.confidence
      },
      message: 'AI response generated'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate AI response',
      message: error.message
    }
  }
}

async function handleContextSearch(parameters: any, context: WorkflowContext): Promise<WorkflowResponse> {
  try {
    if (!parameters.query && !parameters.search) {
      return { success: false, error: 'query is required' }
    }

    const query = parameters.query || parameters.search

    // Search across clients, invoices, quotes, and time entries
    const [clients, invoices, quotes, timeEntries] = await Promise.all([
      prisma.client.findMany({
        where: {
          userId: context.userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          company: true
        }
      }),
      prisma.invoice.findMany({
        where: {
          userId: context.userId,
          OR: [
            { number: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.quote.findMany({
        where: {
          userId: context.userId,
          OR: [
            { number: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.timeEntry.findMany({
        where: {
          userId: context.userId,
          OR: [
            { project: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          project: true,
          hours: true,
          date: true,
          notes: true
        },
        orderBy: { date: 'desc' }
      })
    ])

    const results = {
      clients,
      invoices,
      quotes,
      timeEntries,
      total: clients.length + invoices.length + quotes.length + timeEntries.length
    }

    return {
      success: true,
      data: results,
      message: `Found ${results.total} results`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to search context',
      message: error.message
    }
  }
}

