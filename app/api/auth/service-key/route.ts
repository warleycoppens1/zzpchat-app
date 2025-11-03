import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { generateApiKey, hashApiKey } from '@/lib/encryption'

// POST /api/auth/service-key - Regenerate API key for service account
// Note: Old key becomes invalid immediately
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { serviceAccountId } = await request.json()

    if (!serviceAccountId) {
      return NextResponse.json(
        { error: 'serviceAccountId is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const serviceAccount = await prisma.serviceAccount.findFirst({
      where: {
        id: serviceAccountId,
        OR: [
          { userId: userId },
          { userId: null }
        ]
      }
    })

    if (!serviceAccount) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    // Generate new API key
    const newApiKey = generateApiKey('n8n')
    const newApiKeyHash = hashApiKey(newApiKey)

    // Update service account
    await prisma.serviceAccount.update({
      where: { id: serviceAccountId },
      data: {
        apiKey: newApiKey, // Store temporarily
        apiKeyHash: newApiKeyHash,
        lastUsedAt: null, // Reset usage tracking
        usageCount: 0,
        rateLimitUsed: 0,
      }
    })

    return NextResponse.json({
      apiKey: newApiKey,
      warning: 'Old API key is now invalid. Save this new key securely - it will only be shown once.'
    })
  } catch (error) {
    return handleApiError(error)
  }
}

