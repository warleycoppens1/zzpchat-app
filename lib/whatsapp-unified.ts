/**
 * Unified WhatsApp Service
 * 
 * This service automatically selects between Meta WhatsApp and Twilio WhatsApp
 * based on the WHATSAPP_PROVIDER environment variable.
 * 
 * Defaults to 'meta' if not specified.
 */

import { whatsappService as metaWhatsAppService } from './whatsapp'
import { twilioWhatsAppService } from './twilio-whatsapp'

export type WhatsAppProvider = 'meta' | 'twilio'

/**
 * Get the configured WhatsApp provider
 */
function getProvider(): WhatsAppProvider {
  const provider = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase() as WhatsAppProvider
  
  if (provider !== 'meta' && provider !== 'twilio') {
    console.warn(`Invalid WHATSAPP_PROVIDER: ${provider}. Defaulting to 'meta'.`)
    return 'meta'
  }
  
  return provider
}

/**
 * Unified WhatsApp Service Interface
 * Provides a consistent API regardless of the underlying provider
 */
export class UnifiedWhatsAppService {
  private provider: WhatsAppProvider

  constructor() {
    this.provider = getProvider()
    console.log(`WhatsApp service initialized with provider: ${this.provider}`)
  }

  /**
   * Get the active provider
   */
  getProvider(): WhatsAppProvider {
    return this.provider
  }

  /**
   * Send a text message
   */
  async sendMessage(to: string, message: string, type: 'text' | 'template' = 'text') {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendMessage(to, message)
    } else {
      return await metaWhatsAppService.sendMessage(to, message, type)
    }
  }

  /**
   * Send acknowledgment message
   */
  async sendAcknowledgment(to: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendAcknowledgment(to)
    } else {
      return await metaWhatsAppService.sendAcknowledgment(to)
    }
  }

  /**
   * Send error message
   */
  async sendError(to: string, message: string = 'Je bent niet geregistreerd. Meld je aan op [website]') {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendError(to, message)
    } else {
      return await metaWhatsAppService.sendError(to, message)
    }
  }

  /**
   * Send draft confirmation message
   */
  async sendDraftConfirmation(to: string, draftType: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendDraftConfirmation(to, draftType)
    } else {
      return await metaWhatsAppService.sendDraftConfirmation(to, draftType)
    }
  }

  /**
   * Send draft modification message
   */
  async sendDraftModification(to: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendDraftModification(to)
    } else {
      return await metaWhatsAppService.sendDraftModification(to)
    }
  }

  /**
   * Send draft cancellation message
   */
  async sendDraftCancellation(to: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendDraftCancellation(to)
    } else {
      return await metaWhatsAppService.sendDraftCancellation(to)
    }
  }

  /**
   * Download media (provider-specific)
   */
  async downloadMedia(mediaIdOrUrl: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.downloadMedia(mediaIdOrUrl)
    } else {
      return await metaWhatsAppService.downloadMedia(mediaIdOrUrl)
    }
  }

  /**
   * Get media URL (Meta only)
   */
  async getMediaUrl(mediaId: string) {
    if (this.provider === 'twilio') {
      // Twilio returns URLs directly, not media IDs
      return mediaId
    } else {
      return await metaWhatsAppService.getMediaUrl(mediaId)
    }
  }

  /**
   * Send media message (Twilio only, but wrapper for compatibility)
   */
  async sendMedia(to: string, mediaUrl: string | string[], caption?: string) {
    if (this.provider === 'twilio') {
      return await twilioWhatsAppService.sendMedia(to, mediaUrl, caption)
    } else {
      // Meta WhatsApp handles media differently
      // This would need to be implemented in the Meta service if needed
      throw new Error('Media sending via Meta WhatsApp not implemented in unified service. Use direct Meta service.')
    }
  }
}

// Export singleton instance
export const unifiedWhatsAppService = new UnifiedWhatsAppService()

