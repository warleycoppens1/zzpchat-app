import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const updateServiceAccountSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/service-accounts/[id] - Get service account details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const serviceAccount = await prisma.serviceAccount.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          { userId: null }
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
        rateLimitUsed: true,
        rateLimitReset: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
        // Never return apiKey or apiKeyHash
      }
    })

    if (!serviceAccount) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ serviceAccount })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/service-accounts/[id] - Update service account
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    const validatedData = updateServiceAccountSchema.parse(body)

    // Verify ownership
    const existing = await prisma.serviceAccount.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          { userId: null }
        ]
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    const serviceAccount = await prisma.serviceAccount.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        userId: true,
        permissions: true,
        active: true,
        rateLimit: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ serviceAccount })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/service-accounts/[id] - Delete service account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    // Verify ownership
    const existing = await prisma.serviceAccount.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          { userId: null }
        ]
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    // Soft delete by deactivating
    await prisma.serviceAccount.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Service account deactivated' })
  } catch (error) {
    return handleApiError(error)
  }
}

