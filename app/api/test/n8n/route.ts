import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAuth } from '@/lib/service-auth-middleware'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/test/n8n
 * Test endpoint for n8n authentication and basic connectivity
 */
export async function GET(request: NextRequest) {
  try {
    // Test service authentication
    const auth = await requireServiceAuth(request)

    return NextResponse.json({
      success: true,
      message: 'n8n authentication successful',
      serviceAccount: {
        id: auth.serviceAccountId,
        name: auth.serviceAccountName,
        permissions: auth.permissions
      },
      user: {
        id: auth.userId,
        email: auth.userEmail,
        name: auth.userName
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/test/n8n
 * Test endpoint for n8n workflow action execution
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireServiceAuth(request)
    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: 'n8n test action executed',
      received: {
        body,
        serviceAccount: {
          id: auth.serviceAccountId,
          name: auth.serviceAccountName
        },
        user: {
          id: auth.userId,
          email: auth.userEmail
        }
      },
      timestamp: new Date().toISOString(),
      instructions: {
        endpoint: '/api/webhooks/n8n',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key-here'
        },
        body: {
          action: 'create_invoice',
          parameters: {
            clientId: 'client-uuid',
            description: 'Test invoice',
            amount: 1000
          },
          userId: auth.userId
        }
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

