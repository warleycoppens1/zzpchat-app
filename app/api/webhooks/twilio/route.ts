import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'
import { twilioWhatsAppService } from '@/lib/twilio-whatsapp'
import { aiAgentService } from '@/lib/ai-agent'

/**
 * POST /api/webhooks/twilio
 * Handle Twilio WhatsApp webhook events
 * 
 * Twilio sends webhooks for:
 * - Incoming messages
 * - Message status updates
 * - Delivery receipts
 */
export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook data (comes as form-urlencoded)
    const formData = await request.formData()
    
    // Convert FormData to object
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
    
    console.log('Twilio webhook received:', JSON.stringify(body, null, 2))

    // Validate webhook signature (recommended for production)
    if (process.env.TWILIO_VALIDATE_WEBHOOK === 'true') {
      const signature = request.headers.get('x-twilio-signature')
      const url = request.url
      
      if (signature && !twilioWhatsAppService.validateWebhookSignature(url, body, signature)) {
        console.error('Twilio webhook signature validation failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    // Process different webhook event types
    const messageSid = body.MessageSid
    const messageStatus = body.MessageStatus
    const messageBody = body.Body
    const from = body.From
    const to = body.To
    const numMedia = parseInt(body.NumMedia || '0')

    // Handle incoming message
    if (messageBody && from && to) {
      await processIncomingMessage({
        messageSid,
        from: from.replace('whatsapp:', ''),
        to: to.replace('whatsapp:', ''),
        messageBody,
        numMedia,
        body,
      })
    }

    // Handle message status updates
    if (messageSid && messageStatus) {
      console.log(`Message ${messageSid} status: ${messageStatus}`)
      // You can update message status in your database here
      // await updateMessageStatus(messageSid, messageStatus)
    }

    // Twilio expects a TwiML response or empty 200
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    return handleApiError(error)
  }
}

/**
 * GET /api/webhooks/twilio
 * Health check endpoint for Twilio
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'twilio-webhook',
    timestamp: new Date().toISOString(),
    endpoints: {
      post: '/api/webhooks/twilio - Handle Twilio WhatsApp webhooks'
    }
  })
}

/**
 * Process incoming WhatsApp message from Twilio
 */
async function processIncomingMessage(data: {
  messageSid: string
  from: string
  to: string
  messageBody: string
  numMedia: number
  body: Record<string, string>
}) {
  try {
    const { messageSid, from, to, messageBody, numMedia, body } = data

    // Extract contact name (if available in Twilio webhook)
    const contactName = body.ProfileName || 'Unknown'

    // Process message data
    const messageData = {
      messageId: messageSid,
      from,
      contactName,
      messageType: numMedia > 0 ? 'media' : 'text',
      message: messageBody,
      timestamp: new Date().toISOString(),
      mediaCount: numMedia,
    }

    console.log('Twilio WhatsApp message received:', messageData)

    // Send acknowledgment
    try {
      await twilioWhatsAppService.sendAcknowledgment(from)
    } catch (error) {
      console.error('Failed to send acknowledgment:', error)
    }

    // Handle media messages
    const mediaUrls: string[] = []
    if (numMedia > 0) {
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = body[`MediaUrl${i}`]
        const contentType = body[`MediaContentType${i}`]
        
        if (mediaUrl) {
          mediaUrls.push(mediaUrl)
          console.log(`Media ${i + 1}: ${contentType} - ${mediaUrl}`)
          
          // Download and process media if needed
          // For audio messages, transcribe
          if (contentType?.startsWith('audio/')) {
            try {
              const mediaData = await twilioWhatsAppService.downloadMedia(mediaUrl)
              const transcription = await aiAgentService.transcribeAudio(mediaData.buffer)
              
              // Update message with transcription
              messageData.message = transcription
              console.log('Audio transcribed:', transcription)
            } catch (error) {
              console.error('Audio transcription failed:', error)
            }
          }
        }
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
              from,
              body: messageData.message
            },
            ...messageData,
            mediaUrls,
          }),
        })
        console.log('Message forwarded to SimAI workflow')
      } catch (error) {
        console.error('Failed to forward to SimAI:', error)
      }
    }

    // You can also process the message directly here
    // For example: resolve user, analyze intent, generate response, etc.
    
  } catch (error) {
    console.error('Error processing Twilio WhatsApp message:', error)
  }
}

