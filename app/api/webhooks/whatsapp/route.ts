import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'
import { whatsappService } from '@/lib/whatsapp'
import { aiAgentService } from '@/lib/ai-agent'

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
      
      // Process WhatsApp message for SimAI workflow
      const messageData = {
        messageId: message.id,
        from: message.from,
        contactName: contact?.profile?.name || 'Unknown',
        messageType: message.type,
        message: extractMessageText(message),
        timestamp: new Date().toISOString(),
      }

      console.log('WhatsApp message received:', messageData)
      
      // Send acknowledgment (Block 1 from SimAI workflow)
      try {
        await whatsappService.sendAcknowledgment(message.from)
      } catch (error) {
        console.error('Failed to send acknowledgment:', error)
      }

      // Handle audio messages
      if (message.type === 'audio' && message.audio?.id) {
        try {
          // Download and transcribe audio
          const audioUrl = await whatsappService.getMediaUrl(message.audio.id)
          const audioResponse = await fetch(audioUrl, {
            headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
          })
          const audioBuffer = await audioResponse.arrayBuffer()
          const transcription = await aiAgentService.transcribeAudio(audioBuffer)
          
          // Update message with transcription
          messageData.message = transcription
          console.log('Audio transcribed:', transcription)
        } catch (error) {
          console.error('Audio transcription failed:', error)
        }
      }

      // Forward to SimAI workflow if configured
      if (process.env.SIMAI_WEBHOOK_URL) {
        try {
          await fetch(process.env.SIMAI_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SIMAI_API_KEY}`,
            },
            body: JSON.stringify({
              type: 'whatsapp_message',
              whatsapptrigger: {
                from: message.from,
                body: messageData.message
              },
              ...messageData
            }),
          })
          console.log('Message forwarded to SimAI workflow')
        } catch (error) {
          console.error('Failed to forward to SimAI:', error)
        }
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
