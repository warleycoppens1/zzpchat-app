import { handleApiError } from './errors'

/**
 * Twilio WhatsApp Service
 * Handles WhatsApp messaging via Twilio API
 * 
 * This service provides a similar interface to the Meta WhatsApp service
 * but uses Twilio's API for messaging.
 */
export class TwilioWhatsAppService {
  private accountSid: string
  private authToken: string
  private fromNumber: string // Twilio WhatsApp-enabled phone number

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER || '' // Format: whatsapp:+1234567890
  }

  private ensureCredentials() {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM_NUMBER')
    }
  }

  /**
   * Format phone number for Twilio (add whatsapp: prefix if needed)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any existing whatsapp: prefix
    const cleaned = phone.replace(/^whatsapp:/, '')
    // Add whatsapp: prefix if not present
    return cleaned.startsWith('whatsapp:') ? cleaned : `whatsapp:${cleaned}`
  }

  /**
   * Send a text message via Twilio WhatsApp API
   */
  async sendMessage(
    to: string, 
    message: string, 
    options?: {
      mediaUrl?: string | string[]
      statusCallback?: string
    }
  ) {
    this.ensureCredentials()
    
    const formattedTo = this.formatPhoneNumber(to)
    const formattedFrom = this.formatPhoneNumber(this.fromNumber)
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    
    const formData = new URLSearchParams()
    formData.append('From', formattedFrom)
    formData.append('To', formattedTo)
    formData.append('Body', message)

    // Add media URL if provided
    if (options?.mediaUrl) {
      const mediaUrls = Array.isArray(options.mediaUrl) ? options.mediaUrl : [options.mediaUrl]
      mediaUrls.forEach((url, index) => {
        formData.append(`MediaUrl${index}`, url)
      })
    }

    // Add status callback if provided
    if (options?.statusCallback) {
      formData.append('StatusCallback', options.statusCallback)
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Twilio API error: ${response.statusText} - ${errorData}`)
      }

      const data = await response.json()
      
      return {
        sid: data.sid,
        status: data.status,
        to: data.to,
        from: data.from,
        body: data.body,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
      }
    } catch (error) {
      console.error('Twilio send message error:', error)
      throw error
    }
  }

  /**
   * Send acknowledgment message (Block 1 from SimAI workflow)
   */
  async sendAcknowledgment(to: string) {
    return this.sendMessage(to, '⚡ Bericht ontvangen! Ik ga ermee aan de slag...')
  }

  /**
   * Send error message for unregistered users
   */
  async sendError(to: string, message: string = 'Je bent niet geregistreerd. Meld je aan op [website]') {
    return this.sendMessage(to, message)
  }

  /**
   * Send draft confirmation message
   */
  async sendDraftConfirmation(to: string, draftType: string) {
    const messages = {
      invoice: '✅ Factuur is aangemaakt en verstuurd!',
      quote: '✅ Offerte is aangemaakt en verstuurd!',
      time_entry: '✅ Urenregistratie is toegevoegd!',
      email_summary: '✅ Email samenvatting is verstuurd!',
      calendar_event: '✅ Afspraak is ingepland!'
    }
    
    const message = messages[draftType as keyof typeof messages] || '✅ Draft is bevestigd en verstuurd!'
    return this.sendMessage(to, message)
  }

  /**
   * Send draft modification message
   */
  async sendDraftModification(to: string) {
    return this.sendMessage(to, '🔄 Wijziging verwerkt. Nieuwe versie wordt gegenereerd...')
  }

  /**
   * Send draft cancellation message
   */
  async sendDraftCancellation(to: string) {
    return this.sendMessage(to, '❌ Draft geannuleerd.')
  }

  /**
   * Send media message (image, document, video, etc.)
   */
  async sendMedia(
    to: string, 
    mediaUrl: string | string[], 
    caption?: string
  ) {
    const message = caption || ''
    return this.sendMessage(to, message, { mediaUrl })
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string) {
    this.ensureCredentials()
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageSid}.json`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Twilio API error: ${response.statusText} - ${errorData}`)
      }

      const data = await response.json()
      return {
        sid: data.sid,
        status: data.status,
        errorCode: data.error_code,
        errorMessage: data.error_message,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
        dateSent: data.date_sent,
      }
    } catch (error) {
      console.error('Twilio get message status error:', error)
      throw error
    }
  }

  /**
   * Download media file from Twilio
   * Twilio provides media URLs that can be accessed with auth
   */
  async downloadMedia(mediaUrl: string) {
    this.ensureCredentials()
    
    try {
      const response = await fetch(mediaUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Twilio media download error: ${response.statusText}`)
      }

      return {
        buffer: await response.arrayBuffer(),
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        contentLength: response.headers.get('content-length'),
      }
    } catch (error) {
      console.error('Twilio media download error:', error)
      throw error
    }
  }

  /**
   * Validate webhook signature (for Twilio webhook security)
   */
  validateWebhookSignature(
    url: string,
    params: Record<string, string>,
    signature: string
  ): boolean {
    const crypto = require('crypto')
    
    // Create the signature string
    const signatureString = url + Object.keys(params)
      .sort()
      .map(key => `${key}${params[key]}`)
      .join('')
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha1', this.authToken)
    hmac.update(signatureString)
    const expectedSignature = hmac.digest('base64')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }
}

// Export singleton instance
export const twilioWhatsAppService = new TwilioWhatsAppService()

