import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { generateApiKey, hashApiKey } from '@/lib/encryption'
import { z } from 'zod'

const createServiceAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  userId: z.string().uuid().optional(),
  permissions: z.array(z.string()).optional().default([]),
  rateLimit: z.number().int().positive().optional(),
})

// GET /api/service-accounts - Get all service accounts (admin only, or user's own)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    const serviceAccounts = await prisma.serviceAccount.findMany({
      where: {
        OR: [
          { userId: userId }, // User's own service accounts
          { userId: null }     // Global service accounts (if admin)
        ]
      },
      select: {
        id: true,
        name: true,
        userId: true,
        permissions: true,
        active: true,
        lastUsedAt: true,
        usageCount: true,
        rateLimit: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
        // Never return apiKey or apiKeyHash
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ serviceAccounts })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/service-accounts - Create new service account
export async function POST(request: NextRequest) {
  try {
    const { userId: creatorId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createServiceAccountSchema.parse(body)

    // Generate API key (shown only once)
    const apiKey = generateApiKey('n8n')
    const apiKeyHash = hashApiKey(apiKey)

    // Create service account
    const serviceAccount = await prisma.serviceAccount.create({
      data: {
        name: validatedData.name,
        apiKey: apiKey, // Store plain key only temporarily for response
        apiKeyHash: apiKeyHash,
        userId: validatedData.userId || creatorId, // Default to creator if not specified
        permissions: validatedData.permissions,
        rateLimit: validatedData.rateLimit,
        active: true,
      },
      select: {
        id: true,
        name: true,
        apiKey: true, // Only returned on creation
        userId: true,
        permissions: true,
        active: true,
        rateLimit: true,
        createdAt: true,
      }
    })

    // Return with warning that API key won't be shown again
    return NextResponse.json({
      serviceAccount,
      warning: 'API key will only be shown once. Save it securely.'
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

