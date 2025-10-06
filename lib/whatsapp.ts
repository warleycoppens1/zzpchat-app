import { handleApiError } from './errors'

export class WhatsAppService {
  private accessToken: string
  private phoneNumberId: string

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!
    
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp credentials not configured')
    }
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  async sendMessage(to: string, message: string, type: 'text' | 'template' = 'text') {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: type,
      text: type === 'text' ? { body: message } : undefined,
      template: type === 'template' ? { 
        name: message, 
        language: { code: 'nl' } 
      } : undefined
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`WhatsApp API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      return await response.json()
    } catch (error) {
      console.error('WhatsApp send message error:', error)
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
   * Download media file from WhatsApp
   */
  async downloadMedia(mediaId: string) {
    const url = `https://graph.facebook.com/v18.0/${mediaId}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`WhatsApp media download error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('WhatsApp media download error:', error)
      throw error
    }
  }

  /**
   * Get media URL for downloading
   */
  async getMediaUrl(mediaId: string) {
    const mediaData = await this.downloadMedia(mediaId)
    return mediaData.url
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()
