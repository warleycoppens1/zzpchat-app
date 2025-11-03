import { NextRequest, NextResponse } from 'next/server'
import { requireServiceAuth } from '@/lib/service-auth-middleware'
import { handleApiError } from '@/lib/errors'
import { routeWorkflowAction } from '@/lib/n8n-router'
import { extractUserContext, validateUserContext, createWorkflowContext } from '@/lib/workflow-context'

/**
 * POST /api/webhooks/n8n
 * Main webhook endpoint for n8n workflows
 * 
 * Expected payload:
 * {
 *   "action": "create_invoice",
 *   "parameters": { ... },
 *   "userId": "user-uuid" // Required unless service account is bound to user
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate service account
    const auth = await requireServiceAuth(request)
    
    // Parse request body
    let body: any
    if (auth.requestBody) {
      body = auth.requestBody
    } else {
      body = await request.json()
    }

    const { action, parameters = {}, userId: requestedUserId } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get service account to check if bound to user
    const { prisma } = await import('@/lib/prisma')
    const serviceAccount = await prisma.serviceAccount.findUnique({
      where: { id: auth.serviceAccountId },
      select: { userId: true }
    })

    // Extract and validate user context
    const userId = extractUserContext(
      auth.userId,
      serviceAccount?.userId || null,
      requestedUserId
    )

    // Validate user context
    const validatedContext = await validateUserContext(userId, auth.serviceAccountId)

    // Create workflow context
    const workflowContext = createWorkflowContext(
      validatedContext.userId,
      validatedContext.userEmail,
      validatedContext.userName,
      validatedContext.serviceAccountId,
      auth.serviceAccountName,
      auth.permissions
    )

    // Route action to appropriate handler
    const result = await routeWorkflowAction(action, parameters, workflowContext)

    // Return formatted response for n8n
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
        context: {
          userId: workflowContext.userId,
          userName: workflowContext.userName,
          action: action
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message,
        context: {
          userId: workflowContext.userId,
          action: action
        }
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('n8n webhook error:', error)
    
    // Handle specific error types
    if (error.message?.includes('required')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }

    return handleApiError(error)
  }
}

/**
 * GET /api/webhooks/n8n
 * Health check endpoint for n8n
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'n8n-webhook',
    timestamp: new Date().toISOString(),
    endpoints: {
      post: '/api/webhooks/n8n - Process workflow actions'
    },
    availableActions: [
      'create_invoice',
      'create_quote',
      'add_time_entry',
      'add_kilometer',
      'create_contact',
      'search_contacts',
      'get_invoices',
      'get_quotes',
      'ai_intent',
      'context_search'
    ]
  })
}

