import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

/**
 * OAuth Callback Endpoint
 * Handles OAuth callbacks and stores tokens
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=missing_parameters', request.url)
      )
    }

    // Decode state to get userId and provider
    let stateData: { userId: string; provider: string }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=invalid_state', request.url)
      )
    }

    const { userId, provider } = stateData
    const callbackUrl = `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/${provider}/callback`

    switch (provider.toLowerCase()) {
      case 'google':
      case 'gmail':
      case 'google-drive':
      case 'google-calendar': {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          callbackUrl
        )

        const { tokens } = await oauth2Client.getToken(code)

        if (!tokens.access_token) {
          return NextResponse.redirect(
            new URL('/dashboard/integrations?error=no_access_token', request.url)
          )
        }

        // Determine integration type based on provider
        let integrationType = 'GMAIL'
        if (provider === 'google-drive') {
          integrationType = 'GOOGLE_DRIVE'
        } else if (provider === 'google-calendar') {
          integrationType = 'GOOGLE_CALENDAR'
        } else if (provider === 'google') {
          // Store as GMAIL but with extended scopes
          integrationType = 'GMAIL'
        }

        // Encrypt tokens
        const encryptedCredentials = encrypt(JSON.stringify({
          accessToken: tokens.access_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
        }))

        const encryptedRefreshToken = tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : null

        // Store in database
        await prisma.integration.upsert({
          where: {
            type_userId: {
              type: integrationType as any,
              userId
            }
          },
          create: {
            type: integrationType as any,
            userId,
            credentials: encryptedCredentials,
            refreshToken: encryptedRefreshToken,
            scope: tokens.scope ? tokens.scope.split(' ') : [],
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            status: 'CONNECTED',
            connectedAt: new Date()
          },
          update: {
            credentials: encryptedCredentials,
            refreshToken: encryptedRefreshToken,
            scope: tokens.scope ? tokens.scope.split(' ') : [],
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            status: 'CONNECTED',
            connectedAt: new Date()
          }
        })

        return NextResponse.redirect(
          new URL('/dashboard/integrations?success=connected', request.url)
        )
      }

      case 'microsoft':
      case 'outlook':
      case 'outlook-mail':
      case 'outlook-calendar': {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID || '',
            client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
            code,
            redirect_uri: callbackUrl,
            grant_type: 'authorization_code'
          })
        })

        if (!tokenResponse.ok) {
          return NextResponse.redirect(
            new URL('/dashboard/integrations?error=token_exchange_failed', request.url)
          )
        }

        const tokens = await tokenResponse.json()

        if (!tokens.access_token) {
          return NextResponse.redirect(
            new URL('/dashboard/integrations?error=no_access_token', request.url)
          )
        }

        // Determine integration type
        let integrationType = 'OUTLOOK_MAIL'
        if (provider === 'outlook-calendar') {
          integrationType = 'OUTLOOK_CALENDAR'
        } else if (provider === 'outlook' || provider === 'microsoft') {
          integrationType = 'OUTLOOK_MAIL' // Default to mail
        }

        // Encrypt tokens
        const encryptedCredentials = encrypt(JSON.stringify({
          accessToken: tokens.access_token,
          expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined
        }))

        const encryptedRefreshToken = tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : null

        // Store in database
        await prisma.integration.upsert({
          where: {
            type_userId: {
              type: integrationType as any,
              userId
            }
          },
          create: {
            type: integrationType as any,
            userId,
            credentials: encryptedCredentials,
            refreshToken: encryptedRefreshToken,
            scope: tokens.scope ? tokens.scope.split(' ') : [],
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            status: 'CONNECTED',
            connectedAt: new Date()
          },
          update: {
            credentials: encryptedCredentials,
            refreshToken: encryptedRefreshToken,
            scope: tokens.scope ? tokens.scope.split(' ') : [],
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            status: 'CONNECTED',
            connectedAt: new Date()
          }
        })

        return NextResponse.redirect(
          new URL('/dashboard/integrations?success=connected', request.url)
        )
      }

      default:
        return NextResponse.redirect(
          new URL('/dashboard/integrations?error=unsupported_provider', request.url)
        )
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', request.url)
    )
  }
}

