/**
 * Outlook Mail Integration Service
 * Handles Microsoft Graph API operations for Outlook Mail
 */

import { BaseIntegration, IntegrationCredentials } from '../base'

export interface OutlookMessage {
  id: string
  subject: string
  bodyPreview: string
  body?: string
  from?: {
    emailAddress: {
      address: string
      name?: string
    }
  }
  toRecipients?: Array<{
    emailAddress: {
      address: string
      name?: string
    }
  }>
  receivedDateTime?: Date
  isRead?: boolean
  webLink?: string
}

export interface OutlookListOptions {
  top?: number
  skip?: number
  filter?: string
  search?: string
}

export class OutlookMailService extends BaseIntegration {
  private accessToken: string | null = null
  private graphApiUrl = 'https://graph.microsoft.com/v1.0'

  constructor(userId: string) {
    super(userId, 'OUTLOOK_MAIL')
  }

  /**
   * Get valid access token
   */
  private async getAccessToken(): Promise<string> {
    if (!this.accessToken || !this.credentials) {
      await this.load()
      this.accessToken = await this.getValidAccessToken()
    }
    return this.accessToken
  }

  /**
   * Refresh access token
   */
  protected async refreshAccessToken(): Promise<IntegrationCredentials> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID || '',
        scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send',
        refresh_token: this.credentials.refreshToken,
        grant_type: 'refresh_token',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || ''
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.credentials.refreshToken,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      scope: this.credentials.scope
    }
  }

  /**
   * Make authenticated request to Microsoft Graph
   */
  private async graphRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.graphApiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Graph API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * List messages
   */
  async listMessages(options: OutlookListOptions = {}): Promise<{
    messages: OutlookMessage[]
    nextLink?: string
  }> {
    const params = new URLSearchParams()
    if (options.top) params.append('$top', options.top.toString())
    if (options.skip) params.append('$skip', options.skip.toString())
    if (options.filter) params.append('$filter', options.filter)
    if (options.search) params.append('$search', options.search)

    const queryString = params.toString()
    const endpoint = `/me/messages${queryString ? `?${queryString}` : ''}`

    const response = await this.graphRequest(endpoint)

    const messages: OutlookMessage[] = (response.value || []).map((msg: any) => this.parseMessage(msg))

    return {
      messages,
      nextLink: response['@odata.nextLink']
    }
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<OutlookMessage> {
    const response = await this.graphRequest(`/me/messages/${messageId}`)
    return this.parseMessage(response)
  }

  /**
   * Send message
   */
  async sendMessage(
    to: string | string[],
    subject: string,
    body: string,
    options: {
      cc?: string[]
      bcc?: string[]
      importance?: 'low' | 'normal' | 'high'
    } = {}
  ): Promise<string> {
    const recipients = Array.isArray(to) ? to : [to]
    
    const message = {
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        toRecipients: recipients.map(email => ({
          emailAddress: { address: email }
        })),
        ...(options.cc && {
          ccRecipients: options.cc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        ...(options.bcc && {
          bccRecipients: options.bcc.map(email => ({
            emailAddress: { address: email }
          }))
        }),
        importance: options.importance || 'normal'
      }
    }

    const response = await this.graphRequest('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify(message)
    })

    return response.id || 'sent'
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, maxResults: number = 10): Promise<OutlookMessage[]> {
    const result = await this.listMessages({
      search: `"${query}"`,
      top: maxResults
    })
    return result.messages
  }

  /**
   * Get unread messages
   */
  async getUnreadMessages(maxResults: number = 10): Promise<OutlookMessage[]> {
    const result = await this.listMessages({
      filter: "isRead eq false",
      top: maxResults
    })
    return result.messages
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.graphRequest(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: true })
    })
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.graphRequest(`/me/messages/${messageId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Parse Outlook message to our format
   */
  private parseMessage(message: any): OutlookMessage {
    return {
      id: message.id,
      subject: message.subject || '',
      bodyPreview: message.bodyPreview || '',
      body: message.body?.content,
      from: message.from,
      toRecipients: message.toRecipients,
      receivedDateTime: message.receivedDateTime ? new Date(message.receivedDateTime) : undefined,
      isRead: message.isRead,
      webLink: message.webLink
    }
  }

  /**
   * Get folders
   */
  async getFolders(): Promise<Array<{ id: string; displayName: string }>> {
    const response = await this.graphRequest('/me/mailFolders')
    return (response.value || []).map((folder: any) => ({
      id: folder.id,
      displayName: folder.displayName
    }))
  }
}

