/**
 * Google Calendar Integration Service
 * Handles Google Calendar API operations
 */

import { BaseIntegration, IntegrationCredentials } from '../base'
import { google } from 'googleapis'

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  organizer?: {
    email: string
    displayName?: string
  }
  htmlLink?: string
}

export interface CalendarListOptions {
  timeMin?: Date
  timeMax?: Date
  maxResults?: number
  calendarId?: string
}

export class CalendarService extends BaseIntegration {
  private oauth2Client: any
  private calendar: any

  constructor(userId: string) {
    super(userId, 'GOOGLE_CALENDAR')
  }

  /**
   * Initialize OAuth2 client
   */
  private async initializeClient(): Promise<void> {
    if (!this.credentials) {
      await this.load()
    }

    if (!this.credentials) {
      throw new Error('Google Calendar not connected')
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

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
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
   * List events
   */
  async listEvents(options: CalendarListOptions = {}): Promise<CalendarEvent[]> {
    await this.initializeClient()

    const calendarId = options.calendarId || 'primary'

    const response = await this.calendar.events.list({
      calendarId,
      timeMin: options.timeMin?.toISOString(),
      timeMax: options.timeMax?.toISOString(),
      maxResults: options.maxResults || 50,
      singleEvents: true,
      orderBy: 'startTime'
    })

    return (response.data.items || []).map((event: any) => this.parseEvent(event))
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarEvent> {
    await this.initializeClient()

    const response = await this.calendar.events.get({
      calendarId,
      eventId
    })

    return this.parseEvent(response.data)
  }

  /**
   * Create event
   */
  async createEvent(
    summary: string,
    start: Date,
    end: Date,
    options: {
      description?: string
      location?: string
      attendees?: string[]
      calendarId?: string
    } = {}
  ): Promise<CalendarEvent> {
    await this.initializeClient()

    const calendarId = options.calendarId || 'primary'

    const event = {
      summary,
      description: options.description,
      location: options.location,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: options.attendees?.map(email => ({ email }))
    }

    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: event
    })

    return this.parseEvent(response.data)
  }

  /**
   * Update event
   */
  async updateEvent(
    eventId: string,
    updates: {
      summary?: string
      description?: string
      location?: string
      start?: Date
      end?: Date
      attendees?: string[]
    },
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    await this.initializeClient()

    // Get existing event first
    const existingEvent = await this.calendar.events.get({
      calendarId,
      eventId
    })

    const event: any = {
      ...existingEvent.data,
      summary: updates.summary ?? existingEvent.data.summary,
      description: updates.description ?? existingEvent.data.description,
      location: updates.location ?? existingEvent.data.location
    }

    if (updates.start || updates.end) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
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
    }

    if (updates.attendees) {
      event.attendees = updates.attendees.map(email => ({ email }))
    }

    const response = await this.calendar.events.update({
      calendarId,
      eventId,
      requestBody: event
    })

    return this.parseEvent(response.data)
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    await this.initializeClient()

    await this.calendar.events.delete({
      calendarId,
      eventId
    })
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days: number = 7, calendarId: string = 'primary'): Promise<CalendarEvent[]> {
    const now = new Date()
    const maxDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return this.listEvents({
      timeMin: now,
      timeMax: maxDate,
      calendarId
    })
  }

  /**
   * Search events
   */
  async searchEvents(query: string, maxResults: number = 10): Promise<CalendarEvent[]> {
    await this.initializeClient()

    const response = await this.calendar.events.list({
      calendarId: 'primary',
      q: query,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    })

    return (response.data.items || []).map((event: any) => this.parseEvent(event))
  }

  /**
   * Parse Google Calendar event to our format
   */
  private parseEvent(event: any): CalendarEvent {
    const startDate = event.start?.dateTime || event.start?.date
    const endDate = event.end?.dateTime || event.end?.date

    return {
      id: event.id,
      summary: event.summary || '',
      description: event.description,
      start: new Date(startDate),
      end: new Date(endDate),
      location: event.location,
      attendees: event.attendees?.map((a: any) => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus
      })),
      organizer: event.organizer ? {
        email: event.organizer.email,
        displayName: event.organizer.displayName
      } : undefined,
      htmlLink: event.htmlLink
    }
  }

  /**
   * List calendars
   */
  async listCalendars(): Promise<Array<{ id: string; summary: string; description?: string }>> {
    await this.initializeClient()

    const response = await this.calendar.calendarList.list()

    return (response.data.items || []).map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      description: calendar.description
    }))
  }
}

