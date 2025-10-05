import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createOfferSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  validUntil: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional().default('DRAFT'),
  notes: z.string().optional(),
})

// GET /api/offers - Get all offers for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: any = { userId }
    
    if (status) {
      where.status = status
    }
    
    if (clientId) {
      where.clientId = clientId
    }

    const offers = await prisma.quote.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return NextResponse.json({ offers })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createOfferSchema.parse(body)

    // Check if client exists and belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.client,
        userId
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const { client: clientId, ...restData } = validatedData
    const offer = await prisma.quote.create({
      data: {
        ...restData,
        number: `Q-${Date.now()}`,
        clientId: clientId,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
