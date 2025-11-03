/**
 * Gmail Integration Service
 * Handles Gmail API operations
 */

import { BaseIntegration, IntegrationCredentials } from '../base'
import { google } from 'googleapis'

export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  subject?: string
  from?: string
  to?: string
  date?: Date
  body?: string
}

export interface GmailListOptions {
  maxResults?: number
  pageToken?: string
  query?: string
  labelIds?: string[]
}

export class GmailService extends BaseIntegration {
  private oauth2Client: any
  private gmail: any

  constructor(userId: string) {
    super(userId, 'GMAIL')
  }

  /**
   * Initialize OAuth2 client
   */
  private async initializeClient(): Promise<void> {
    if (!this.credentials) {
      await this.load()
    }

    if (!this.credentials) {
      throw new Error('Gmail not connected')
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/google/callback`
    )

    const accessToken = await this.getValidAccessToken()
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: this.credentials.refreshToken
    })

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * Refresh access token
   */
  protected async refreshAccessToken(): Promise<IntegrationCredentials> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available')
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/google/callback`
    )

    this.oauth2Client.setCredentials({
      refresh_token: this.credentials.refreshToken
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()

    return {
      accessToken: credentials.access_token,
      refreshToken: this.credentials.refreshToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      scope: this.credentials.scope
    }
  }

  /**
   * List messages
   */
  async listMessages(options: GmailListOptions = {}): Promise<{
    messages: GmailMessage[]
    nextPageToken?: string
  }> {
    await this.initializeClient()

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      q: options.query,
      labelIds: options.labelIds
    })

    const messages = await Promise.all(
      (response.data.messages || []).map(async (msg: any) => {
        const fullMessage = await this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        })

        return this.parseMessage(fullMessage.data)
      })
    )

    return {
      messages,
      nextPageToken: response.data.nextPageToken
    }
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<GmailMessage> {
    await this.initializeClient()

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    })

    return this.parseMessage(response.data)
  }

  /**
   * Send message
   */
  async sendMessage(to: string, subject: string, body: string): Promise<string> {
    await this.initializeClient()

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    })

    return response.data.id
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, maxResults: number = 10): Promise<GmailMessage[]> {
    const result = await this.listMessages({ query, maxResults })
    return result.messages
  }

  /**
   * Get unread messages
   */
  async getUnreadMessages(maxResults: number = 10): Promise<GmailMessage[]> {
    const result = await this.listMessages({
      query: 'is:unread',
      maxResults
    })
    return result.messages
  }

  /**
   * Parse Gmail message to our format
   */
  private parseMessage(message: any): GmailMessage {
    const headers = message.payload?.headers || []
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value

    let body = ''
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
    } else if (message.payload?.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8')
            break
          }
        }
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      snippet: message.snippet || '',
      subject: getHeader('subject'),
      from: getHeader('from'),
      to: getHeader('to'),
      date: message.internalDate ? new Date(parseInt(message.internalDate)) : undefined,
      body
    }
  }

  /**
   * Get labels
   */
  async getLabels(): Promise<Array<{ id: string; name: string }>> {
    await this.initializeClient()

    const response = await this.gmail.users.labels.list({
      userId: 'me'
    })

    return (response.data.labels || []).map((label: any) => ({
      id: label.id,
      name: label.name
    }))
  }
}

