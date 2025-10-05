import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { handleApiError, UnauthorizedError } from '../../../lib/errors'
import { z } from 'zod'

// Webhook payload schema for n8n
const n8nWebhookSchema = z.object({
  type: z.enum(['whatsapp_message', 'ai_response', 'invoice_created', 'quote_created', 'email_notification']),
  userId: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
})

// Verify webhook signature (basic auth for now)
function verifyWebhookAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.N8N_API_KEY}`
  
  return authHeader === expectedAuth
}

// POST /api/webhooks/n8n - Handle n8n webhook events
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyWebhookAuth(request)) {
      throw new UnauthorizedError('Invalid webhook authentication')
    }

    const body = await request.json()
    const validatedData = n8nWebhookSchema.parse(body)

    // Process different webhook types
    switch (validatedData.type) {
      case 'whatsapp_message':
        await handleWhatsAppMessage(validatedData)
        break
        
      case 'ai_response':
        await handleAIResponse(validatedData)
        break
        
      case 'invoice_created':
        await handleInvoiceCreated(validatedData)
        break
        
      case 'quote_created':
        await handleQuoteCreated(validatedData)
        break
        
      case 'email_notification':
        await handleEmailNotification(validatedData)
        break
        
      default:
        console.log(`Unknown webhook type: ${validatedData.type}`)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return handleApiError(error)
  }
}

async function handleWhatsAppMessage(data: any) {
  // Create AI conversation record
  await prisma.aI_Conversation.create({
    data: {
      userId: data.userId,
      whatsappMessageId: data.data.messageId,
      userMessage: data.data.message,
      status: 'PROCESSING',
    }
  })
}

async function handleAIResponse(data: any) {
  // Update AI conversation with response
  await prisma.aI_Conversation.updateMany({
    where: {
      userId: data.userId,
      whatsappMessageId: data.data.messageId,
    },
    data: {
      aiResponse: data.data.response,
      actionType: data.data.actionType || 'UNKNOWN',
      actionData: data.data.actionData || {},
      status: 'COMPLETED',
    }
  })
}

async function handleInvoiceCreated(data: any) {
  // Log invoice creation event
  console.log(`Invoice created via n8n for user ${data.userId}:`, data.data)
  
  // Could trigger additional workflows like:
  // - Send email notification
  // - Update CRM
  // - Generate PDF
}

async function handleQuoteCreated(data: any) {
  // Log quote creation event
  console.log(`Quote created via n8n for user ${data.userId}:`, data.data)
  
  // Could trigger additional workflows like:
  // - Send email notification
  // - Schedule follow-up
  // - Update CRM
}

async function handleEmailNotification(data: any) {
  // Log email notification event
  console.log(`Email notification sent via n8n for user ${data.userId}:`, data.data)
  
  // Could update notification status in database
}
