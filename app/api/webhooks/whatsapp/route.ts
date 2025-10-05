import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'

// GET /api/webhooks/whatsapp - WhatsApp webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verify the webhook
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified successfully')
      return new NextResponse(challenge, { status: 200 })
    } else {
      console.error('WhatsApp webhook verification failed')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/webhooks/whatsapp - Handle WhatsApp webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Process WhatsApp webhook data
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await processWhatsAppMessage(change.value)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return handleApiError(error)
  }
}

async function processWhatsAppMessage(messageData: any) {
  try {
    // Extract message information
    const messages = messageData.messages || []
    const contacts = messageData.contacts || []
    
    for (const message of messages) {
      const contact = contacts.find((c: any) => c.wa_id === message.from)
      
      // Forward to n8n for AI processing
      if (process.env.N8N_WEBHOOK_URL) {
        const n8nPayload = {
          type: 'whatsapp_message',
          messageId: message.id,
          from: message.from,
          contactName: contact?.profile?.name || 'Unknown',
          messageType: message.type,
          message: extractMessageText(message),
          timestamp: new Date().toISOString(),
        }

        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
          },
          body: JSON.stringify(n8nPayload),
        })

        console.log('Message forwarded to n8n:', n8nPayload)
      }
    }
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
  }
}

function extractMessageText(message: any): string {
  switch (message.type) {
    case 'text':
      return message.text?.body || ''
    case 'audio':
      return '[Voice message]'
    case 'image':
      return message.image?.caption || '[Image]'
    case 'document':
      return message.document?.caption || '[Document]'
    case 'video':
      return message.video?.caption || '[Video]'
    default:
      return `[${message.type} message]`
  }
}
