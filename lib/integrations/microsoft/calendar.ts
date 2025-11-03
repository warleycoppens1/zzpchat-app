/**
 * Outlook Calendar Integration Service
 * Handles Microsoft Graph API operations for Outlook Calendar
 */

import { BaseIntegration, IntegrationCredentials } from '../base'

export interface OutlookCalendarEvent {
  id: string
  subject: string
  body?: string
  start: Date
  end: Date
  location?: {
    displayName: string
    address?: {
      street?: string
      city?: string
      state?: string
      countryOrRegion?: string
      postalCode?: string
    }
  }
  attendees?: Array<{
    emailAddress: {
      address: string
      name?: string
    }
    type: string
    status?: {
      response: string
      time?: Date
    }
  }>
  organizer?: {
    emailAddress: {
      address: string
      name?: string
    }
  }
  webLink?: string
  isAllDay?: boolean
  showAs?: string
  importance?: string
}

export interface OutlookCalendarListOptions {
  startDateTime?: Date
  endDateTime?: Date
  top?: number
  filter?: string
}

export class OutlookCalendarService extends BaseIntegration {
  private accessToken: string | null = null
  private graphApiUrl = 'https://graph.microsoft.com/v1.0'

  constructor(userId: string) {
    super(userId, 'OUTLOOK_CALENDAR')
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
        scope: 'https://graph.microsoft.com/Calendars.ReadWrite',
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
   * List events
   */
  async listEvents(options: OutlookCalendarListOptions = {}): Promise<OutlookCalendarEvent[]> {
    const params = new URLSearchParams()
    
    if (options.startDateTime) {
      params.append('startDateTime', options.startDateTime.toISOString())
    }
    if (options.endDateTime) {
      params.append('endDateTime', options.endDateTime.toISOString())
    }
    if (options.top) {
      params.append('$top', options.top.toString())
    }
    if (options.filter) {
      params.append('$filter', options.filter)
    }

    const queryString = params.toString()
    const endpoint = `/me/calendar/events${queryString ? `?${queryString}` : ''}`

    const response = await this.graphRequest(endpoint)

    return (response.value || []).map((event: any) => this.parseEvent(event))
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<OutlookCalendarEvent> {
    const response = await this.graphRequest(`/me/calendar/events/${eventId}`)
    return this.parseEvent(response)
  }

  /**
   * Create event
   */
  async createEvent(
    subject: string,
    start: Date,
    end: Date,
    options: {
      body?: string
      location?: string
      attendees?: string[]
      isAllDay?: boolean
    } = {}
  ): Promise<OutlookCalendarEvent> {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const event: any = {
      subject,
      start: {
        dateTime: start.toISOString(),
        timeZone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone
      },
      ...(options.body && {
        body: {
          contentType: 'HTML',
          content: options.body
        }
      }),
      ...(options.location && {
        location: {
          displayName: options.location
        }
      }),
      ...(options.attendees && {
        attendees: options.attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        }))
      }),
      isAllDay: options.isAllDay || false
    }

    const response = await this.graphRequest('/me/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event)
    })

    return this.parseEvent(response)
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: string,
    updates: {
      subject?: string
      body?: string
      location?: string
      start?: Date
      end?: Date
      attendees?: string[]
    }
  ): Promise<OutlookCalendarEvent> {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const event: any = {}
    
    if (updates.subject) event.subject = updates.subject
    if (updates.body) {
      event.body = {
        contentType: 'HTML',
        content: updates.body
      }
    }
    if (updates.location) {
      event.location = {
        displayName: updates.location
      }
    }
    if (updates.start) {
      event.start = {
        dateTime: updates.start.toISOString(),
        timeZone
      }
    }
    if (updates.end) {
      event.end = {
        dateTime: updates.end.toISOString(),
        timeZone
      }
    }
    if (updates.attendees) {
      event.attendees = updates.attendees.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      }))
    }

    const response = await this.graphRequest(`/me/calendar/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(event)
    })

    return this.parseEvent(response)
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.graphRequest(`/me/calendar/events/${eventId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days: number = 7): Promise<OutlookCalendarEvent[]> {
    const now = new Date()
    const maxDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return this.listEvents({
      startDateTime: now,
      endDateTime: maxDate
    })
  }

  /**
   * Parse Outlook event to our format
   */
  private parseEvent(event: any): OutlookCalendarEvent {
    return {
      id: event.id,
      subject: event.subject || '',
      body: event.body?.content,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      location: event.location,
      attendees: event.attendees?.map((a: any) => ({
        emailAddress: a.emailAddress,
        type: a.type,
        status: a.status
      })),
      organizer: event.organizer,
      webLink: event.webLink,
      isAllDay: event.isAllDay || false,
      showAs: event.showAs,
      importance: event.importance
    }
  }

  /**
   * List calendars
   */
  async listCalendars(): Promise<Array<{ id: string; name: string }>> {
    const response = await this.graphRequest('/me/calendars')
    return (response.value || []).map((calendar: any) => ({
      id: calendar.id,
      name: calendar.name
    }))
  }
}

