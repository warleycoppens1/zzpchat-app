import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/integrations/status
 * Get status of all integrations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    const integrations = await prisma.integration.findMany({
      where: {
        userId,
        status: 'CONNECTED'
      },
      select: {
        type: true,
        status: true,
        connectedAt: true,
        expiresAt: true
      }
    })

    const integrationNames: Record<string, string> = {
      'GMAIL': 'gmail',
      'GOOGLE_DRIVE': 'drive',
      'GOOGLE_CALENDAR': 'calendar',
      'OUTLOOK_MAIL': 'outlook',
      'OUTLOOK_CALENDAR': 'outlook-calendar'
    }

    const availableIntegrations = integrations
      .map(i => integrationNames[i.type] || i.type.toLowerCase())
      .filter(Boolean)

    return NextResponse.json({
      integrations: availableIntegrations,
      connected: integrations.map(i => ({
        type: integrationNames[i.type] || i.type.toLowerCase(),
        status: i.status,
        connectedAt: i.connectedAt,
        expiresAt: i.expiresAt
      }))
    })
  } catch (error) {
    return handleApiError(error)
  }
}

