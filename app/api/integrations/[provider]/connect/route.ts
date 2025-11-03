import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { google } from 'googleapis'

/**
 * OAuth Connect Endpoint
 * Initiates OAuth flow for various providers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { provider } = params

    const callbackUrl = `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/${provider}/callback`

    switch (provider.toLowerCase()) {
      case 'google':
      case 'gmail':
      case 'google-drive':
      case 'google-calendar': {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          return NextResponse.json(
            { error: 'Google OAuth not configured' },
            { status: 500 }
          )
        }

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          callbackUrl
        )

        // Determine scopes based on provider
        let scopes: string[] = []
        if (provider === 'google' || provider === 'gmail') {
          scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send'
          ]
        } else if (provider === 'google-drive') {
          scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file'
          ]
        } else if (provider === 'google-calendar') {
          scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        } else {
          // Full Google access
          scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        }

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent', // Force consent screen to get refresh token
          state: Buffer.from(JSON.stringify({ userId, provider })).toString('base64')
        })

        return NextResponse.json({
          authUrl,
          provider,
          redirect: true
        })
      }

      case 'microsoft':
      case 'outlook':
      case 'outlook-mail':
      case 'outlook-calendar': {
        if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
          return NextResponse.json(
            { error: 'Microsoft OAuth not configured' },
            { status: 500 }
          )
        }

        // Determine scopes based on provider
        let scopes: string[] = []
        if (provider === 'outlook-mail' || provider === 'outlook') {
          scopes = [
            'https://graph.microsoft.com/Mail.Read',
            'https://graph.microsoft.com/Mail.Send'
          ]
        } else if (provider === 'outlook-calendar') {
          scopes = [
            'https://graph.microsoft.com/Calendars.ReadWrite'
          ]
        } else {
          // Full Microsoft access
          scopes = [
            'https://graph.microsoft.com/Mail.Read',
            'https://graph.microsoft.com/Mail.Send',
            'https://graph.microsoft.com/Calendars.ReadWrite'
          ]
        }

        const state = Buffer.from(JSON.stringify({ userId, provider })).toString('base64')
        
        const params = new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          response_type: 'code',
          redirect_uri: callbackUrl,
          response_mode: 'query',
          scope: scopes.join(' '),
          state: state
        })

        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`

        return NextResponse.json({
          authUrl,
          provider,
          redirect: true
        })
      }

      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        )
    }
  } catch (error) {
    return handleApiError(error)
  }
}

